"""
Generate "core clauses" from sample agreements.

Plain-language summary:
- Reads sample .docx rental agreements in ai/dataset/.
- Breaks text into clause-like sentences and groups similar ones.
- Keeps only groups that appear across many documents (common/expected clauses).
- Names each clause using a short AI-generated title and writes them to normal_data.py.

Safe to re-run: this will overwrite normal_data.py and keep a timestamped backup.
Adjust behavior by setting environment variables (see README for examples).
"""
import os
import re
import sys
import docx
import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_similarity

# Allow running as a script from ai/ or as a module (python -m ai.generate_core_clauses)
try:
    from ai.utils.embedding_utils import get_embeddings
    from ai.utils.summarizer_utils import _generate_with_gemini_models
except Exception:
    # Fallback: adjust sys.path to include parent directory so 'utils' can be imported when run from ai/
    current_dir = os.path.dirname(__file__)
    if current_dir not in sys.path:
        sys.path.append(current_dir)
    try:
        from utils.embedding_utils import get_embeddings
        from utils.summarizer_utils import _generate_with_gemini_models
    except Exception as e:
        raise ImportError(f"Failed to import utils modules: {e}")

# --- Configuration ---
# Resolve dataset path relative to this file to avoid CWD issues
BASE_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(BASE_DIR, "dataset")

# Controls how aggressively clauses are merged into clusters.
try:
    CLUSTERING_THRESHOLD = float(os.getenv("CLUSTERING_THRESHOLD", "0.50"))
except Exception:
    CLUSTERING_THRESHOLD = 0.50

# Minimum number of occurrences for a cluster to be considered for core.
try:
    MIN_CLUSTER_SIZE = int(os.getenv("MIN_CLUSTER_SIZE", "5"))
except Exception:
    MIN_CLUSTER_SIZE = 5

# Required document coverage fraction (e.g., 0.60–0.70) for a cluster to be a core clause.
try:
    COVERAGE_THRESHOLD = float(os.getenv("COVERAGE_THRESHOLD", "0.65"))
except Exception:
    COVERAGE_THRESHOLD = 0.65

# Target range for number of core clauses
try:
    TARGET_MIN = int(os.getenv("TARGET_MIN", "10"))
except Exception:
    TARGET_MIN = 10
try:
    TARGET_MAX = int(os.getenv("TARGET_MAX", "15"))
except Exception:
    TARGET_MAX = 15

def read_docx_files(path: str) -> tuple[list[str], list[int], int]:
    """Reads all .docx files and returns clauses with their originating document IDs.

    Returns:
        clauses: list of clause strings
        clause_doc_ids: list of same length as clauses with doc index per clause
        total_docs: number of .docx files processed
    """
    clauses: list[str] = []
    clause_doc_ids: list[int] = []
    print(f"Reading .docx files from '{path}'...")
    doc_files = [f for f in os.listdir(path) if f.endswith(".docx")]
    for doc_idx, filename in enumerate(doc_files):
        doc = docx.Document(os.path.join(path, filename))
        for para in doc.paragraphs:
            # Simple cleaning: ignore very short or empty paragraphs
            if para.text and len(para.text.strip()) > 20:
                # Use regex to split paragraphs that might contain multiple sentences/clauses
                parts = re.split(r'\.\s+', para.text.strip())
                for c in parts:
                    if c:
                        clauses.append(c)
                        clause_doc_ids.append(doc_idx)
    print(f"Extracted {len(clauses)} clauses from {len(doc_files)} documents.")
    return clauses, clause_doc_ids, len(doc_files)

def get_cluster_representative(cluster_indices, embeddings, clauses):
    """Finds the most central (representative) clause in a cluster."""
    cluster_embeddings = np.array([embeddings[i] for i in cluster_indices], dtype=np.float32)
    # Calculate the mean of all embeddings in the cluster to find its "center"
    centroid = np.mean(cluster_embeddings, axis=0)
    
    # Calculate the similarity of each embedding in the cluster to the centroid
    similarities = cosine_similarity(cluster_embeddings, centroid.reshape(1, -1))
    
    # The index of the most similar embedding is our representative
    most_similar_idx_in_cluster = np.argmax(similarities)
    original_idx = cluster_indices[most_similar_idx_in_cluster]
    
    return clauses[original_idx]


def cluster_and_filter(
    embeddings: list[list[float]],
    clauses: list[str],
    clause_doc_ids: list[int],
    total_docs: int,
    clustering_threshold: float,
    min_cluster_size: int,
    coverage_threshold: float,
):
    """Cluster embeddings and return representative clause texts for clusters that pass filters.

    Returns a list of representative clause texts for the retained clusters.
    """
    model = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=1 - clustering_threshold,
        metric="cosine",
        linkage="average",
    )
    model.fit(np.array(embeddings, dtype=np.float32))
    labels = model.labels_

    clusters: dict[int, list[int]] = {}
    for i, label in enumerate(labels):
        clusters.setdefault(label, []).append(i)

    kept_reps: list[str] = []
    for label, indices in clusters.items():
        if len(indices) < min_cluster_size:
            continue
        docs_in_cluster = {clause_doc_ids[i] for i in indices}
        coverage = len(docs_in_cluster) / max(1, total_docs)
        if coverage < coverage_threshold:
            continue
        rep_text = get_cluster_representative(indices, embeddings, clauses)
        kept_reps.append(rep_text)
    return kept_reps

def generate_clause_name(clause_text: str) -> str:
    """Uses a generative model to create a short, descriptive name for a clause."""
    prompt = f"""
    You are an expert legal analyst. Read the following legal clause and provide a short, 2-4 word descriptive title for it.
    For example, if the clause is "Tenant shall pay Landlord a monthly rent...", the title should be "Rent Payment".

    Clause: "{clause_text}"
    
    Title:
    """
    name = _generate_with_gemini_models(prompt)
    return name.strip().replace('"', '') if name else "Unnamed Clause"

def main():
    """Main function to run the clause generation process."""
    # 1. Read all clauses from the dataset
    clauses, clause_doc_ids, total_docs = read_docx_files(DATASET_PATH)
    
    # 2. Generate embeddings for all clauses
    print("Generating embeddings for all clauses... (This might take a while)")
    embeddings = get_embeddings(clauses)
    
    # 3. Auto-tune parameters to aim for TARGET_MIN..TARGET_MAX core clauses
    print("Clustering and selecting core clauses (auto-tuning to target count)...")
    candidate_clusterings = [
        float(os.getenv("CLUSTERING_THRESHOLD", str(CLUSTERING_THRESHOLD))),
        0.55, 0.50, 0.60, 0.45
    ]
    candidate_coverages = [
        float(os.getenv("COVERAGE_THRESHOLD", str(COVERAGE_THRESHOLD))),
        0.60, 0.55, 0.50, 0.45, 0.40
    ]
    candidate_min_sizes = [
        int(os.getenv("MIN_CLUSTER_SIZE", str(MIN_CLUSTER_SIZE))),
        6, 5, 4, 3
    ]

    best = None  # (abs_distance_from_range, count, reps, params)
    for ct in candidate_clusterings:
        reps_ct = None
        for cov in candidate_coverages:
            for ms in candidate_min_sizes:
                reps = cluster_and_filter(
                    embeddings, clauses, clause_doc_ids, total_docs,
                    clustering_threshold=ct,
                    min_cluster_size=ms,
                    coverage_threshold=cov,
                )
                count = len(reps)
                # compute distance from target range
                if TARGET_MIN <= count <= TARGET_MAX:
                    distance = 0
                elif count < TARGET_MIN:
                    distance = TARGET_MIN - count
                else:
                    distance = count - TARGET_MAX
                score = (distance, abs(count - ((TARGET_MIN + TARGET_MAX)//2)))
                if (best is None) or (score < best[0:2]):
                    best = (score[0], score[1], reps, {"ct": ct, "cov": cov, "ms": ms})
        
    if not best:
        print("No clusters found with any parameter combination. Writing empty CORE_CLAUSES.")
        selected_reps = []
        chosen_params = {"ct": CLUSTERING_THRESHOLD, "cov": COVERAGE_THRESHOLD, "ms": MIN_CLUSTER_SIZE}
    else:
        selected_reps = best[2]
        chosen_params = best[3]

    print(f"Selected {len(selected_reps)} core clauses with params: "
          f"CT={chosen_params['ct']}, Coverage>={chosen_params['cov']}, MinSize={chosen_params['ms']}")

    # 4. Name and build the CORE_CLAUSES dictionary from selected representatives
    core_clauses_dict = {}
    for idx, representative_text in enumerate(selected_reps):
        clause_name = generate_clause_name(representative_text)
        if clause_name in core_clauses_dict:
            clause_name = f"{clause_name} {idx}"
        clean_text = representative_text.replace('\n', ' ').strip()
        core_clauses_dict[clause_name] = clean_text + "." if not clean_text.endswith('.') else clean_text

    # 5. Write the result directly into ai/normal_data.py
    out_path = os.path.join(os.path.dirname(__file__), "normal_data.py")
    # Backup existing file to preserve manual edits
    try:
        if os.path.exists(out_path):
            import shutil, datetime
            ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
            backup_path = os.path.join(os.path.dirname(out_path), f"normal_data.backup.{ts}.py")
            shutil.copyfile(out_path, backup_path)
            print(f"Backed up existing normal_data.py to {backup_path}")
    except Exception as e:
        print(f"Warning: failed to back up normal_data.py: {e}")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write('"""\n')
        f.write("Auto-generated core clauses from dataset.\n")
        f.write("Do not edit manually—re-run generate_core_clauses.py to refresh.\n")
        f.write('"""\n\n')
        f.write("from typing import Dict\n\n")
        f.write("CORE_CLAUSES: Dict[str, str] = {\n")
        for name, text in core_clauses_dict.items():
            safe_name = name.replace('"', "'")
            safe_text = text.replace('"', "'")
            f.write(f'    "{safe_name}": "{safe_text}",\n')
        f.write("}\n")

    print(f"\nWrote {len(core_clauses_dict)} core clauses to {out_path}.")
    if not core_clauses_dict:
        print("Note: No clusters met the minimum size. Consider adjusting CLUSTERING_THRESHOLD or dataset quality.")

if __name__ == "__main__":
    main()