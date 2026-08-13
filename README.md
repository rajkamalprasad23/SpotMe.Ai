# 📸 SpotMe.Ai

### AI-Powered Event Photo Retrieval Using Face Recognition & Vector Similarity Search

SpotMe.Ai is an AI-powered photo retrieval system designed to help users quickly find their photographs from large collections of event images.

Instead of manually searching through hundreds or thousands of photographs, a user provides a **query photograph containing their face**. The system detects the face, generates a numerical **facial embedding**, and searches a database of previously generated embeddings using **vector similarity search**.

The project combines **computer vision, deep learning, vector databases, PostgreSQL, and approximate nearest-neighbor search** to build an efficient visual retrieval pipeline.

---

## ✨ What Problem Does SpotMe.Ai Solve?

At events such as college fests, conferences, competitions, and social gatherings, photographers can capture thousands of photographs.

Finding photographs of one particular person manually is:

* ⏳ Time-consuming
* 🔍 Difficult to scale
* 😵 Tedious for users
* 📷 Dependent on manually browsing every photograph

SpotMe.Ai converts this into a visual search problem.

### Traditional Approach

```text
Thousands of Photos
        │
        ▼
Manually Browse Photos
        │
        ▼
Find Yourself
        │
        ▼
Repeat...
```

### SpotMe.Ai Approach

```text
                Query Photo
                     │
                     ▼
               Face Detection
                     │
                     ▼
            Facial Embedding
                     │
                     ▼
          Vector Similarity Search
                     │
                     ▼
            Matching Photographs
```

---

# 🚀 Key Features

* 🤖 AI-based face recognition
* 🧠 Facial embedding generation using InsightFace
* 📁 Google Drive based image retrieval
* 🖼️ Image preprocessing using OpenCV
* 🗄️ PostgreSQL database integration
* 🔢 Vector storage using pgvector
* ⚡ HNSW approximate nearest-neighbor indexing
* 🔎 Similarity-based image retrieval
* 📊 Retrieval latency testing
* 🐍 Python-based processing pipeline

---

# 🏗️ System Architecture

The system is divided into two major stages:

1. **Indexing / Database Creation**
2. **Query / Photo Retrieval**

```text
                         ┌──────────────────────┐
                         │     EVENT PHOTOS     │
                         │     Google Drive     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Image Downloading  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Face Detection    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Face Embedding       │
                         │ Generation           │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ PostgreSQL + pgvector│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     HNSW Index       │
                         └──────────┬───────────┘
                                    │
                                    │
                         ┌──────────▼───────────┐
                         │    Query Photograph  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Query Face Embedding │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Vector Similarity   │
                         │       Search         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Matching Photographs │
                         └──────────────────────┘
```

---

# 🔄 End-to-End Workflow

The complete pipeline can be understood as:

```text
┌─────────────────┐
│ Event Photos    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Download Images │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Detect Faces    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate        │
│ Face Embeddings │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store Embeddings│
│ in PostgreSQL   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HNSW Vector     │
│ Index           │
└────────┬────────┘
         │
         │
         │        ┌─────────────────┐
         └────────│ Query Image     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Detect Query    │
                  │ Face            │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Generate Query  │
                  │ Embedding       │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Vector Search   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Ranked Matching │
                  │ Photographs     │
                  └─────────────────┘
```

---

# 🧠 1. Face Detection & Embedding Generation

The first important step is converting photographs into representations that can be searched efficiently.

SpotMe.Ai uses **InsightFace** for face analysis.

Instead of comparing entire photographs pixel-by-pixel, the system first identifies the face.

```text
                 Input Photograph
                        │
                        ▼
                ┌───────────────┐
                │ Face Detector │
                └───────┬───────┘
                        │
                        ▼
                   Detected Face
                        │
                        ▼
                ┌───────────────┐
                │ Neural Network│
                └───────┬───────┘
                        │
                        ▼
                Face Embedding
                        │
                        ▼
             [e₁, e₂, e₃, ..., eₙ]
```

A facial embedding is a numerical representation of a face.

For example:

```text
Face
 │
 ▼
[ 0.12, -0.43, 0.81, 0.05, ... ]
 │
 ▼
Numerical Representation
```

The important idea is that similar faces should produce embeddings that are close to each other in the embedding space.

---

# 🎯 2. Why Use Face Embeddings?

Direct image comparison is unreliable because the same person can appear under different conditions:

* Different lighting
* Different camera angles
* Different facial expressions
* Different backgrounds
* Different image resolutions
* Different distances from the camera

Instead of comparing pixels:

```text
Image A ──────────────── Image B
        Pixel Comparison
```

SpotMe.Ai compares learned representations:

```text
Image A                    Image B
   │                          │
   ▼                          ▼
Embedding A              Embedding B
   │                          │
   └───────────┬──────────────┘
               ▼
        Vector Similarity
```

This makes the retrieval process much more robust than direct pixel comparison.

---

# 🔢 3. Understanding the Embedding Space

An embedding can be represented mathematically as:

```text
E = [e₁, e₂, e₃, ..., eₙ]
```

Every photograph containing a detected face can therefore be represented by a point in a high-dimensional vector space.

Conceptually:

```text
                 Embedding Space

                      Person B
                         ●
                        /
                       /
             Query ●──● Person A
                  \
                   \
                    ● Person A
```

Faces that are more similar tend to occupy nearby regions of this space.

This allows the system to perform **nearest-neighbor search**.

---

# 🗄️ 4. Database Architecture

SpotMe.Ai uses:

* **PostgreSQL** for structured data
* **pgvector** for storing and searching embeddings
* **HNSW** for efficient approximate nearest-neighbor retrieval

Conceptually, a stored record can contain:

```text
┌─────────────────────────────────┐
│          Photo Record           │
├─────────────────────────────────┤
│ Photo ID                        │
│ File Name                       │
│ File Metadata                   │
│ Face Information                │
│ Face Embedding                  │
└─────────────────────────────────┘
```

The embedding is the key component used during similarity search.

---

# 🔢 5. Why PostgreSQL + pgvector?

Traditional relational databases are excellent for structured information:

```text
photo_id
filename
event_id
timestamp
metadata
```

However, facial embeddings are high-dimensional numerical vectors.

**pgvector** allows these vectors to be stored and searched directly inside PostgreSQL.

```text
                 PostgreSQL
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   Structured Data        Face Embeddings
                                │
                                ▼
                             pgvector
                                │
                                ▼
                         Vector Search
```

This keeps metadata and vector representations within the same database architecture.

---

# 🔎 6. Vector Similarity Search

Suppose the database contains:

```text
Photo 001 → Embedding A
Photo 002 → Embedding B
Photo 003 → Embedding C
Photo 004 → Embedding D
...
```

When a user uploads a query photograph:

```text
Query Image
     │
     ▼
Query Face
     │
     ▼
Query Embedding Q
```

The system searches for embeddings that are closest to `Q`.

Conceptually:

```text
                Embedding Space

                     B ●
                      /
                     /
              Q ●───● A
                   /
                  /
                 ● C

                         ● D
```

The closest vectors become the strongest candidates for matching photographs.

---

# 📐 7. Vector Similarity

For two vectors:

```text
A = [a₁, a₂, ..., aₙ]

B = [b₁, b₂, ..., bₙ]
```

one common similarity measure is **cosine similarity**:

```text
              A · B
cos(θ) = ─────────────
         ||A|| ||B||
```

A higher similarity indicates that the vectors point in more similar directions.

The vector database handles the mathematical search over the stored embeddings.

---

# ⚡ 8. Why HNSW?

A naive implementation could compare the query embedding against every stored embedding:

```text
                    Query
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   Vector 1       Vector 2       Vector 3
       │              │              │
       └──────────────┼──────────────┘
                      │
                     ...
                      │
                      ▼
                   Vector N
```

For a small dataset this can work.

But as the number of embeddings grows, searching every vector for every query becomes increasingly expensive.

This is where **HNSW** is useful.

---

# 🌐 9. HNSW — Hierarchical Navigable Small World

HNSW stands for:

> **Hierarchical Navigable Small World**

It is an **Approximate Nearest Neighbor (ANN)** indexing algorithm.

Instead of scanning every vector, HNSW organizes vectors into a graph with multiple hierarchical layers.

A simplified representation:

```text
Level 2:

        A ───────── D
         \          /
          \        /
             B


Level 1:

     A ─── B ─── C ─── D
      \     │     │
       \    │     │
        E ──F──── G


Level 0:

A ─ B ─ C ─ D ─ E ─ F ─ G ─ H ─ I ─ J ─ K
```

Higher levels provide longer-range connections.

Lower levels contain more detailed connections.

---

# 🧭 10. How HNSW Search Works

When a query vector `Q` arrives, the search conceptually works like this:

```text
                  Query Q
                     │
                     ▼
              Start at upper layer
                     │
                     ▼
            Find promising neighbor
                     │
                     ▼
             Move toward Q
                     │
                     ▼
             Descend a layer
                     │
                     ▼
           Refine candidate region
                     │
                     ▼
                 Level 0
                     │
                     ▼
             Nearest Candidates
```

Instead of exploring the entire vector space, the algorithm navigates through increasingly relevant regions.

---

# ⚔️ 11. Brute Force vs HNSW

### Brute Force

```text
Query
 │
 ├── Compare → Vector 1
 ├── Compare → Vector 2
 ├── Compare → Vector 3
 ├── Compare → Vector 4
 ├── ...
 └── Compare → Vector N
```

### HNSW

```text
Query
 │
 ▼
Entry Point
 │
 ▼
Promising Region
 │
 ▼
Closer Region
 │
 ▼
Local Search
 │
 ▼
Nearest Candidates
```

### Trade-off

| Approach    | Search Strategy                       | Scalability |
| ----------- | ------------------------------------- | ----------- |
| Brute Force | Compare against every vector          | Lower       |
| HNSW        | Navigate graph toward nearest vectors | Higher      |

HNSW provides approximate nearest-neighbor retrieval, trading a small amount of exactness for substantially more efficient search.

---

# 🏗️ 12. HNSW Index Construction

Conceptually, when embeddings are added:

```text
New Embedding
      │
      ▼
Assign Graph Level
      │
      ▼
Find Nearby Embeddings
      │
      ▼
Create Graph Connections
      │
      ▼
Add to HNSW Structure
```

Over time, these connections form a navigable graph that can be used during query-time retrieval.

---

# 🔄 13. Query-Time Retrieval

Once the database and vector index have been created, a query follows this pipeline:

```text
┌───────────────────────┐
│     Query Image       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│    Face Detection     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Query Face Embedding  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│    pgvector Search    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│     HNSW Index        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Nearest Neighbor      │
│ Search                │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Similarity Ranking    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Matching Photographs  │
└───────────────────────┘
```

---

# 🗂️ 14. Indexing vs Retrieval

A major design principle in SpotMe.Ai is separating **indexing** from **retrieval**.

## Indexing Phase

The expensive processing happens while building the searchable database:

```text
Event Photos
     │
     ▼
Face Detection
     │
     ▼
Embedding Generation
     │
     ▼
Database Storage
     │
     ▼
HNSW Index
```

## Retrieval Phase

Once the index exists, users do not need to process every event photograph again.

```text
Query Photo
     │
     ▼
Query Embedding
     │
     ▼
HNSW Search
     │
     ▼
Matching Photos
```

This makes repeated queries much more efficient.

---

# ☁️ 15. Google Drive Image Retrieval

The project can retrieve event photographs from Google Drive.

The process is:

```text
Google Drive Folder
        │
        ▼
Drive API Request
        │
        ▼
Retrieve File Metadata
        │
        ├── File ID
        ├── File Name
        └── MIME Type
        │
        ▼
Identify Image Files
        │
        ▼
Download Images
        │
        ▼
Image Processing Pipeline
```

File IDs provide a stable way of identifying files instead of relying only on filenames.

---

# 🧩 16. Project Modules

The repository is organized around different stages of the processing pipeline.

| File                    | Responsibility                            |
| ----------------------- | ----------------------------------------- |
| `download.py`           | Retrieves and downloads event images      |
| `embedding_generate.py` | Generates facial embeddings               |
| `database.py`           | Database configuration and operations     |
| `save_to_database.py`   | Stores embeddings and related information |
| `retrive.py`            | Retrieves matching vectors/photos         |
| `compare.py`            | Performs similarity/comparison operations |
| `main.py`               | Main processing/orchestration             |
| `test_latency.py`       | Measures retrieval latency                |
| `requirment.txt`        | Python dependencies                       |

---

# 🔀 17. Project Data Flow

```text
                   Google Drive
                        │
                        ▼
                 ┌─────────────┐
                 │ download.py │
                 └──────┬──────┘
                        │
                        ▼
                    Images
                        │
                        ▼
            ┌──────────────────────┐
            │ embedding_generate.py│
            └───────────┬──────────┘
                        │
                        ▼
                 Face Embeddings
                        │
                        ▼
             ┌────────────────────┐
             │ save_to_database.py │
             └──────────┬─────────┘
                        │
                        ▼
               PostgreSQL/pgvector
                        │
                        ▼
                   HNSW Index
                        │
                        ▼
                ┌──────────────┐
                │  retrive.py  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ compare.py   │
                └──────┬───────┘
                       │
                       ▼
                 Search Results
```

---

# 📊 18. Performance & Latency

The repository contains `test_latency.py` for evaluating retrieval latency.

A query's total latency can be viewed as:

```text
Total Query Latency
        │
        ├── Image Loading
        │
        ├── Face Detection
        │
        ├── Embedding Generation
        │
        ├── Database Query
        │
        └── Vector Search
```

HNSW becomes particularly valuable as the number of stored embeddings increases because it avoids a naive full scan of the vector collection.

---

# 📈 19. Scalability Concept

Without an ANN index:

```text
N stored embeddings
        │
        ▼
Compare query with N vectors
```

With HNSW:

```text
N stored embeddings
        │
        ▼
Graph Navigation
        │
        ▼
Relevant Search Region
        │
        ▼
Nearest Candidates
```

The architecture therefore separates expensive preprocessing from repeated retrieval operations.

---

# 🧪 20. Example Retrieval Scenario

Imagine an event with **5,000 photographs**.

After indexing:

```text
Photo 001 → Embedding
Photo 002 → Embedding
Photo 003 → Embedding
...
Photo 5000 → Embedding
```

A participant uploads a query photograph.

```text
Query Image
     │
     ▼
Query Embedding Q
     │
     ▼
HNSW Search
```

The system may identify candidates such as:

```text
Photo 1842 → High similarity
Photo 2731 → High similarity
Photo 3910 → High similarity
Photo 4127 → Moderate similarity
```

The associated photographs can then be returned to the user.

---

# ⚠️ 21. Real-World Challenges

Face retrieval systems have to deal with real-world conditions such as:

* No face detected
* Multiple faces in an image
* Low-resolution photographs
* Poor lighting
* Extreme viewing angles
* Partial face visibility
* Duplicate images
* Large photo collections
* Network failures
* Database connectivity issues

These factors can affect both embedding quality and retrieval accuracy.

---

# 🛠️ Technology Stack

### Machine Learning & Computer Vision

* **Python**
* **InsightFace**
* **OpenCV**
* **NumPy**

### Database

* **PostgreSQL**
* **pgvector**

### Vector Search

* **HNSW**
* Approximate Nearest Neighbor Search

### Data Source

* **Google Drive API**

### Backend / Processing

* Python-based processing pipeline
* FastAPI components where applicable

---

# 💻 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/rajkamalprasad23/SpotMe.Ai.git
cd SpotMe.Ai
```

## 2. Create a Virtual Environment

```bash
python -m venv venv
```

### Windows

```powershell
venv\Scripts\activate
```

## 3. Install Dependencies

```bash
pip install -r requirment.txt
```

> **Note:** The dependency file in this repository is currently named `requirment.txt`.

---

# 🗄️ Database Requirements

SpotMe.Ai requires:

* PostgreSQL
* pgvector extension

The general setup is:

```text
PostgreSQL
    │
    ▼
Create Database
    │
    ▼
Enable pgvector
    │
    ▼
Create Required Tables
    │
    ▼
Store Face Embeddings
    │
    ▼
Create Vector Index
    │
    ▼
Run Retrieval
```

> **Security:** Database credentials and API keys should be supplied through environment variables or local configuration and should not be committed to a public repository.

---

# 👨‍💻 My Contribution

I primarily worked on the **machine learning and backend components** of SpotMe.Ai.

My contributions included:

* Designing and implementing the face-recognition-based retrieval pipeline.
* Working with InsightFace for face analysis and embedding generation.
* Implementing image processing and preparation workflows.
* Working on event image retrieval and processing.
* Integrating PostgreSQL with the project.
* Working with pgvector for vector embedding storage.
* Implementing vector similarity-based retrieval.
* Working with HNSW approximate nearest-neighbor indexing.
* Testing and evaluating retrieval latency.
* Integrating the machine learning and database components into the overall pipeline.

The project was developed collaboratively, with other team members contributing to additional application and system components.

---

# 🎯 Key Concepts Demonstrated

This project demonstrates practical implementation of:

### Computer Vision

* Face detection
* Face recognition
* Image preprocessing

### Deep Learning

* Facial representation learning
* Embeddings
* Neural-network-based feature extraction

### Vector Search

* Vector similarity
* Approximate Nearest Neighbor Search
* HNSW indexing

### Database Engineering

* PostgreSQL
* pgvector
* Vector storage
* Metadata management

### System Design

* Offline indexing
* Online retrieval
* Precomputation
* Search optimization
* Latency evaluation

---

# 🔮 Future Improvements

Potential improvements include:

* Multi-face retrieval and result grouping
* Better duplicate-image detection
* Adaptive similarity thresholds
* Batch embedding generation
* GPU-accelerated processing
* Background indexing jobs
* Cloud deployment
* Improved ranking strategies
* Pagination for large result sets
* Retrieval monitoring and analytics
* Better handling of low-confidence detections

---

# 📌 Project Summary

SpotMe.Ai demonstrates how **computer vision + deep learning + vector databases + approximate nearest-neighbor search** can be combined to solve a practical visual retrieval problem.

The core pipeline is:

```text
             EVENT PHOTOS
                   │
                   ▼
            Face Detection
                   │
                   ▼
          Face Embeddings
                   │
                   ▼
         PostgreSQL + pgvector
                   │
                   ▼
              HNSW Index
                   │
                   ▼
            Query Embedding
                   │
                   ▼
        Approximate NN Search
                   │
                   ▼
          Similarity Ranking
                   │
                   ▼
          Matching Photographs
```

### The key idea:

> **Convert faces into searchable vector representations once, index them efficiently, and use vector similarity to retrieve the relevant photographs when a user searches.**

---

## 📂 Repository Structure

```text
SpotMe.Ai/
│
├── compare.py
├── database.py
├── download.py
├── embedding_generate.py
├── main.py
├── retrive.py
├── save_to_database.py
├── test_latency.py
├── requirment.txt
├── facefind.zip
├── README.md
└── .gitignore
```

---

## 📜 Project Status

**Status:** Academic / Prototype Project

**Project Type:** Team Project

**Primary Domain:** Artificial Intelligence • Computer Vision • Vector Search

**Primary Contribution:** Machine Learning Pipeline • Face Embeddings • Image Processing • PostgreSQL/pgvector • Similarity Retrieval • HNSW Search
