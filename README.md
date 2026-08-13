SpotMe.Ai
AI-Powered Event Photo Retrieval Using Face Recognition and Vector Similarity Search

SpotMe.Ai is an AI-powered event photography system designed to solve a simple but tedious problem:

Given a photograph of yourself, can the system find all the event photographs in which you appear?

At large events, photographers may capture thousands of photographs. Manually searching through these images is time-consuming and inconvenient. SpotMe.Ai automates this process by converting faces into numerical representations called facial embeddings and using vector similarity search to efficiently retrieve visually similar faces.

The system combines:

Face detection and recognition
Facial embedding generation
Image preprocessing
Google Drive image retrieval
PostgreSQL
pgvector
HNSW approximate nearest-neighbor indexing
Similarity-based retrieval
Python-based backend processing

The core idea is:

Event Photographs
       │
       ▼
   Face Detection
       │
       ▼
 Face Embedding
       │
       ▼
 Vector Representation
       │
       ▼
 PostgreSQL + pgvector
       │
       ▼
 HNSW Vector Index
       │
       │
       │       Query Photograph
       │              │
       │              ▼
       │        Face Detection
       │              │
       │              ▼
       │       Query Embedding
       │              │
       └──────────────┤
                      ▼
              Similarity Search
                      │
                      ▼
             Matching Photographs
1. Problem Statement

Consider an event with several thousand photographs.

A participant wants to find all photographs in which they appear.

A conventional approach would require:

Opening the complete photo collection.
Looking through photographs one by one.
Manually identifying photographs containing the person.
Repeating the process for every participant.

This approach becomes increasingly impractical as the number of photographs grows.

SpotMe.Ai approaches the problem as a visual information retrieval problem.

Instead of comparing images manually, the system converts faces into numerical vectors and searches for vectors that are mathematically similar to the query person's face.

2. Project Objective

The main objective of SpotMe.Ai is to provide an efficient pipeline for:

Collecting event photographs
Detecting faces in photographs
Generating facial embeddings
Storing embeddings efficiently
Searching embeddings using vector similarity
Returning photographs containing visually similar faces

The system separates the problem into two major phases:

                 SPOTME.AI
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     Indexing Phase         Retrieval Phase
          │                     │
          ▼                     ▼
 Process Event Photos      Process Query Photo
          │                     │
          ▼                     ▼
 Generate Embeddings      Generate Query Embedding
          │                     │
          ▼                     ▼
 Store Vectors            Vector Similarity Search
          │                     │
          └──────────┬──────────┘
                     ▼
              Matching Photos
3. High-Level Architecture
                         ┌───────────────────────┐
                         │    Event Photo Set    │
                         │   Google Drive /      │
                         │   Local Collection    │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   Image Downloading   │
                         │     & Processing      │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    Face Detection     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ Facial Embedding      │
                         │     Generation        │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │       pgvector        │
                         │   Vector Storage      │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      HNSW Index       │
                         │ Approximate NN Search │
                         └───────────┬───────────┘
                                     │
                                     │
                         ┌───────────▼───────────┐
                         │    Query Photograph   │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ Query Face Embedding  │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ Similarity Search     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ Matching Photographs  │
                         └───────────────────────┘
4. End-to-End Workflow

The complete system can be understood as two pipelines.

Phase A — Building the Image Database
Google Drive
     │
     ▼
Retrieve image/file information
     │
     ▼
Download photographs
     │
     ▼
Read image
     │
     ▼
Detect face(s)
     │
     ▼
Generate embedding
     │
     ▼
Store embedding + metadata
     │
     ▼
Create/search through vector index
Phase B — Finding a Person
User Query Image
       │
       ▼
Read image
       │
       ▼
Detect face
       │
       ▼
Generate query embedding
       │
       ▼
Compare against stored embeddings
       │
       ▼
Rank by similarity
       │
       ▼
Apply retrieval criteria
       │
       ▼
Return matching photographs
5. Image Retrieval From Google Drive

The project includes functionality for retrieving photographs from Google Drive.

The image acquisition pipeline can be represented as:

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
Download Image
        │
        ▼
Local Image Processing

The downloader uses the Google Drive API to retrieve file metadata and subsequently download image data.

The important advantage of working with file IDs is that the system does not need to rely on the visible filename alone. The Drive file ID uniquely identifies the file.

6. Image Processing Pipeline

Once photographs have been downloaded, they enter the computer vision pipeline.

Input Image
    │
    ▼
Image Loading
    │
    ▼
Image Preprocessing
    │
    ▼
Face Detection
    │
    ▼
Face Alignment / Processing
    │
    ▼
Face Representation
    │
    ▼
Embedding Vector

The project uses computer vision libraries such as OpenCV and NumPy as part of the processing pipeline.

7. Face Recognition With InsightFace

SpotMe.Ai uses InsightFace for face analysis.

Instead of representing an entire photograph directly, the system focuses on the detected face.

A face is transformed into a numerical representation called a facial embedding.

Conceptually:

              Photograph
                  │
                  ▼
            Face Detector
                  │
         ┌────────┴────────┐
         │                 │
      Background          Face
                           │
                           ▼
                     Face Analysis
                           │
                           ▼
                    Neural Network
                           │
                           ▼
                   Face Embedding

A facial embedding can be thought of as a point in a high-dimensional mathematical space.

For example, conceptually:

Face
 │
 ▼
[ 0.12, -0.43, 0.81, 0.05, ... ]
          │
          │
          ▼
   Numerical Vector

The individual values are not human-readable descriptions such as:

"brown hair"
"male"
"wearing glasses"

Instead, the neural network learns a representation in which faces that are visually/identity-wise similar tend to have embeddings that are closer together.

8. Why Embeddings?

Direct pixel comparison is not reliable for face retrieval.

The same person can appear in photographs with:

Different lighting
Different backgrounds
Different camera angles
Different expressions
Different distances from the camera
Different image resolutions

Pixel-level comparison would therefore be extremely sensitive to these changes.

Embeddings provide a more useful representation.

Conceptually:

             Similar Person
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
     Photo A             Photo B
        │                   │
        ▼                   ▼
   Embedding A          Embedding B
        │                   │
        └─────────┬─────────┘
                  ▼
          Small Vector Distance

While two unrelated people are expected to produce more distant representations:

 Person A                     Person B
    │                            │
    ▼                            ▼
Embedding A                  Embedding B
    │                            │
    └───────────┬────────────────┘
                ▼
          Larger Distance
9. What Exactly Is an Embedding?

An embedding is a vector:

E = [e₁, e₂, e₃, ..., eₙ]

where each component is a numerical feature learned by the neural network.

The embedding transforms a complicated visual input into a representation that can be compared mathematically.

Instead of asking:

"Do these two images have similar pixels?"

the system asks:

"Are the representations of the detected faces close in embedding space?"

This makes vector similarity search possible.

10. Database Architecture

SpotMe.Ai uses PostgreSQL as the database.

The project also uses pgvector, which provides support for storing and querying vector embeddings inside PostgreSQL.

Conceptually, a record can contain:

┌─────────────────────────────────────────┐
│              Photo Record               │
├─────────────────────────────────────────┤
│ photo_id                                │
│ file_name                               │
│ file_path / metadata                   │
│ face information                        │
│ embedding vector                        │
└─────────────────────────────────────────┘

The important field for similarity search is the embedding vector.

11. Why PostgreSQL + pgvector?

A conventional relational database is excellent for structured information such as:

photo_id
filename
timestamp
event_id

However, face embeddings are high-dimensional vectors.

pgvector extends PostgreSQL so that vector data can be stored and searched alongside conventional relational data.

This gives the system a unified architecture:

                  PostgreSQL
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
 Structured Metadata          Face Embeddings
        │                           │
        │                           ▼
        │                       pgvector
        │                           │
        └──────────────┬────────────┘
                       ▼
                Vector Search
12. Vector Similarity Search

Suppose the database contains:

Photo 1 → Embedding A
Photo 2 → Embedding B
Photo 3 → Embedding C
Photo 4 → Embedding D
...

A user provides a query photograph.

The system generates:

Query Image
     │
     ▼
Query Embedding Q

The system then searches for vectors closest to Q.

Conceptually:

                 Embedding Space

                      B
                     /
                    /
             Q ●───A
                  /
                 /
                C

                       D

If Q represents the user's face, vectors near Q are candidates for matching photographs.

13. Similarity and Distance

Vector search requires a mathematical measure of similarity or distance.

For two vectors:

A = [a₁, a₂, ..., aₙ]

B = [b₁, b₂, ..., bₙ]

one common measure is cosine similarity:

              A · B
cos(θ) = ─────────────
         ||A|| ||B||

The closer the cosine similarity is to 1, the more aligned the vectors are.

The project uses vector-based retrieval through pgvector, allowing embeddings to be compared efficiently inside PostgreSQL.

14. Why HNSW?

A simple approach would be to compare the query embedding against every stored embedding.

For N stored vectors:

Query
  │
  ├── Compare with Vector 1
  ├── Compare with Vector 2
  ├── Compare with Vector 3
  ├── ...
  └── Compare with Vector N

For a small dataset this may be acceptable.

But event photography can contain thousands or potentially much larger collections.

Performing a full scan for every query becomes expensive.

This is where HNSW becomes useful.

15. HNSW — Hierarchical Navigable Small World

HNSW stands for:

Hierarchical Navigable Small World

It is an approximate nearest-neighbor search algorithm.

Instead of comparing the query against every vector, HNSW organizes vectors into a graph structure that allows the search to navigate toward promising candidates.

A simplified conceptual representation:

                 Level 2
              A -------- D
               \          /
                \        /
                 \      /
                  B

                 Level 1
          A ------ B ------ C ------ D
           \       |        |
            \      |        |
             E ----F--------G

                 Level 0
      A--B--C--D--E--F--G--H--I--J--K

The upper levels contain fewer nodes and provide long-range connections.

The lower levels contain more detailed connections.

16. How HNSW Search Works

Suppose the query vector is Q.

A simplified search looks like:

                 Query Q
                    │
                    ▼
            Start at upper layer
                    │
                    ▼
          Find promising neighbor
                    │
                    ▼
          Move toward closer vector
                    │
                    ▼
             Descend a level
                    │
                    ▼
          Refine candidate search
                    │
                    ▼
             Reach Level 0
                    │
                    ▼
          Return nearest candidates

Instead of searching every vector, the algorithm navigates through a graph toward the nearest region.

17. HNSW vs Brute-Force Search
Brute Force
                 Query
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
      V1          V2          V3  ... VN
       │           │           │
       └───────────┴───────────┘
                   │
                   ▼
             Rank all vectors
HNSW
                 Query
                   │
                   ▼
              Entry Point
                   │
                   ▼
           Promising Region
                   │
                   ▼
             Better Region
                   │
                   ▼
              Local Search
                   │
                   ▼
             Top Candidates

The trade-off is that HNSW performs approximate nearest-neighbor search. It is designed to dramatically reduce search work while maintaining high-quality nearest-neighbor results.

18. HNSW Index Construction

Conceptually, when vectors are inserted:

Embedding
    │
    ▼
Choose graph level
    │
    ▼
Find neighboring vectors
    │
    ▼
Create graph connections
    │
    ▼
Store vector in HNSW structure

Over time, the database develops a navigable graph of vectors.

The result is an index optimized for nearest-neighbor queries.

19. Query-Time Retrieval

When a user submits a photograph:

                 Query Image
                      │
                      ▼
                Face Detection
                      │
                      ▼
             Query Face Embedding
                      │
                      ▼
               pgvector Search
                      │
                      ▼
                 HNSW Index
                      │
             ┌────────┴────────┐
             ▼                 ▼
       Candidate 1       Candidate 2
             │                 │
             └────────┬────────┘
                      ▼
              Similarity Ranking
                      │
                      ▼
             Matching Photographs

The retrieved vectors can then be associated with their corresponding photograph metadata.

20. Complete Retrieval Pipeline

The entire retrieval process can be summarized as:

┌─────────────────────────┐
│     User Query Photo    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Load Image         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Detect Face         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Generate Face Embedding  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Vector Query        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      HNSW Index         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Nearest Neighbor Search │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Similarity Ranking      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Matching Event Photos   │
└─────────────────────────┘
21. Indexing vs Retrieval

One of the most important design concepts in the project is the separation between indexing and retrieval.

Indexing

Indexing is performed when building the searchable photo collection.

Photos
  ↓
Detect Faces
  ↓
Generate Embeddings
  ↓
Store Embeddings
  ↓
Build/Search Vector Index

This work does not need to be repeated for every user query.

Retrieval

Retrieval occurs whenever a user searches for themselves.

Query Photo
  ↓
Generate One Query Embedding
  ↓
Search Existing Index
  ↓
Return Results

This separation makes repeated searches much more efficient.

22. Project Components

The repository contains several Python modules responsible for different parts of the pipeline.

File	Purpose
download.py	Retrieves image/file information and downloads photographs
embedding_generate.py	Generates facial embeddings
database.py	Handles database-related functionality
save_to_database.py	Stores processed information/embeddings
retrive.py	Performs retrieval/search operations
compare.py	Performs comparison-related operations
main.py	Main project entry point / orchestration
test_latency.py	Used for latency/performance testing
requirment.txt	Python dependency list
23. Data Flow

A simplified data flow through the system looks like this:

                Google Drive
                     │
                     ▼
              download.py
                     │
                     ▼
              Image Files
                     │
                     ▼
         embedding_generate.py
                     │
                     ▼
            Face Embeddings
                     │
                     ▼
           save_to_database.py
                     │
                     ▼
            PostgreSQL/pgvector
                     │
                     ▼
              Vector Index
                     │
                     │
                     ▼
              retrive.py
                     │
                     ▼
              compare.py
                     │
                     ▼
             Search Results
24. Database Workflow

The database interaction can be understood in four stages.

Stage 1 — Image Processing
Image → Face → Embedding
Stage 2 — Storage
Embedding + Photo Metadata
            │
            ▼
      PostgreSQL
Stage 3 — Indexing
Stored Embeddings
        │
        ▼
   pgvector/HNSW
        │
        ▼
Searchable Vector Space
Stage 4 — Retrieval
Query Embedding
      │
      ▼
Vector Search
      │
      ▼
Nearest Embeddings
      │
      ▼
Associated Photos
25. Why Vector Databases Are Useful for This Problem

Traditional keyword search works well for queries such as:

"photos from January 10"
"photos from event A"

But the question:

"Find photographs containing this person"

is fundamentally different.

There is no useful keyword that directly describes a person's identity in an arbitrary image.

Instead, the query itself is visual.

Therefore:

Traditional Search:

Text Query → Keywords → Matching Records


SpotMe.Ai:

Image Query → Face Embedding → Vector Similarity → Matching Photos

This makes vector search a natural fit for the problem.

26. Efficiency Considerations

The system is designed around the idea of precomputation.

Instead of repeatedly performing expensive processing:

Every Query
    ↓
Process every event image
    ↓
Detect every face
    ↓
Generate every embedding
    ↓
Compare everything

the system performs the expensive work during indexing:

              One-Time Processing
                     │
                     ▼
             Generate Embeddings
                     │
                     ▼
              Store + Index
                     │
                     ▼
          ┌──────────┴──────────┐
          │          │          │
        Query 1    Query 2    Query 3
          │          │          │
          ▼          ▼          ▼
       Fast Vector Retrieval

This is particularly valuable when the same event photo collection is searched by many different users.

27. Approximate Nearest Neighbor Search

HNSW belongs to the family of Approximate Nearest Neighbor (ANN) algorithms.

The key trade-off is:

Exact Search
     │
     ├── Maximum exactness
     └── Potentially expensive at scale


Approximate Search
     │
     ├── Much faster search
     ├── Scales better
     └── Very high-quality candidates

For image retrieval systems, this trade-off is often highly practical because the goal is to retrieve the most relevant photographs efficiently.

28. Performance Testing

The repository also contains:

test_latency.py

which is used for evaluating retrieval latency.

Latency is important because the user experience depends not only on whether the correct photographs are found, but also on how quickly they are returned.

The overall performance can be viewed as:

Total Query Time
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

The vector index is particularly important when the number of stored embeddings increases.

29. Scalability

The architecture is designed with larger photo collections in mind.

Without vector indexing:

N photos
   ↓
N vector comparisons per query

With an ANN index such as HNSW:

N photos
   ↓
Graph-based navigation
   ↓
Small candidate region
   ↓
Nearest-neighbor results

This allows the search system to remain practical as the number of stored embeddings grows.

30. Example

Suppose an event contains 5,000 photographs.

After processing, the database might conceptually contain:

Photo 001 → Face Embedding
Photo 002 → Face Embedding
Photo 003 → Face Embedding
...
Photo 5000 → Face Embedding

A user uploads a photograph of themselves.

The system generates:

Query → Q

The vector search then identifies:

Q
│
├── Photo 1842 → High similarity
├── Photo 2731 → High similarity
├── Photo 3910 → High similarity
├── Photo 4127 → Moderate similarity
└── ...

The system can then return the most relevant photographs.

31. Error and Edge-Case Considerations

A practical face retrieval system must account for situations such as:

No face detected
Multiple faces detected
Low-quality photographs
Poor lighting
Extreme face angles
Partial face visibility
Duplicate photographs
Large image collections
Network failures during image download
Database connectivity issues

These considerations are important because real-world event photographs are significantly less controlled than benchmark datasets.

32. Technology Stack
Programming
Python
Computer Vision / Machine Learning
InsightFace
OpenCV
NumPy
Backend / Processing
Python-based processing pipeline
FastAPI components where applicable
Database
PostgreSQL
Vector Search
pgvector
HNSW approximate nearest-neighbor indexing
Data Source
Google Drive
33. Project Architecture at a Glance
                         ┌─────────────────────┐
                         │    Google Drive     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Image Downloader   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Image Processing   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   InsightFace       │
                         │ Face Detection +    │
                         │ Embedding Generation│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    PostgreSQL       │
                         │      pgvector       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       HNSW          │
                         │     ANN Index       │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                  Query Photograph       Stored Vectors
                         │                     │
                         ▼                     │
                  Query Embedding             │
                         │                     │
                         └──────────┬──────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Similarity Search   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Matching Photographs│
                         └─────────────────────┘
34. My Contribution

I primarily worked on the machine learning and backend components of SpotMe.Ai.

My work included:

Designing and implementing the face-recognition-based retrieval pipeline.
Working with InsightFace for face analysis and embedding generation.
Processing and preparing event photographs for embedding generation.
Implementing image downloading and processing workflows.
Working with PostgreSQL for storing project data.
Integrating pgvector for vector embedding storage and similarity search.
Working with HNSW-based approximate nearest-neighbor indexing.
Implementing and testing vector-based image retrieval.
Evaluating retrieval latency and performance.
Integrating the different stages of the ML and database pipeline.

The project also involved contributions from other team members in areas such as application and database-related components.