---
title:  "Sorting"
date:   2025-12-08
modified_date: 2026-02-21
summary: ""
tags:
---

# What is Sorting ?

A **Sorting Algorithm** is an algorithm that puts elements of a list into an order.
The most frequently used orders are numerical order and lexicographical order, and either ascending or descending.

Efficient sorting is important for optimizing the efficiency of other algorithms (such as search and merge algorithms) that require input data to be in sorted lists. Sorting is also often useful for canonicalizing data and for producing human-readable output.


**Sorting Algorithm**


1. Selection Sort
2. Insertion Sort
3. Quick Sort
4. Merge Sort
5. Heap sort


## Selection Sort

---
<div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px;">
  <span style="max-width: 60%; line-height: 1.5;">
    <strong>Selection Sort</strong> is a simple, in-place, comparison-based sorting algorithm.
    It works by repeatedly finding the minimum (or maximum) element from the unsorted portion
    of the list and placing it at the beginning (or end) of the sorted portion.
  </span>
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Selection-Sort-Animation.gif"
       alt="Selection Sort Animation"
       style="max-width: 35%; height: 200px;">
</div>

### Step-by-step Example:

```text
Initial array:      64  25  12  22  11

Step 1 (min 11):   <11> 25  12  22  64
Step 2 (min 12):    11 <12> 25  22  64
Step 3 (min 22):    11  12 <22> 25  64
Step 4 (min 25):    11  12  22 <25> 64
Step 5 (done):      11  12  22  25 <64>
```

> **Class:** Sorting algorithm
> **Data structure:** Array
>
> **Worst-case performance:**
>
> * `O(n²)` comparisons
> * `O(n)` swaps
>
> **Best-case performance:**
>
> * `O(n²)` comparisons
> * `O(1)` swap
>
> **Average performance:**
>
> * `O(n²)` comparisons
> * `O(n)` swaps
>
> **Worst-case space complexity:**
>
> * `O(1)` auxiliary
>
> **Optimal:** No



## Bubble Sort
---

**Bubble sort**,sometimes referred to as sinking sort, is a simple sorting algorithm that repeatedly steps through the input list element by element, comparing the current element with the one after it, swapping their values if needed.

<div align="center">
	<img src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Bubble-sort-example-300px.gif"
	       alt="Bubble Sort Animation">
</div>

### Step-by-step example

```text
Take an array of numbers "5 1 4 2 8"

First pass
( 5 1 4 2 8 ) → ( 1 5 4 2 8 ), Here, algorithm compares the first two elements, and swaps since 5 > 1.
( 1 5 4 2 8 ) → ( 1 4 5 2 8 ), Swap since 5 > 4
( 1 4 5 2 8 ) → ( 1 4 2 5 8 ), Swap since 5 > 2
( 1 4 2 5 8 ) → ( 1 4 2 5 8 ), Now, since these elements are already in order (8 > 5), algorithm does not swap them.
Second pass
( 1 4 2 5 8 ) → ( 1 4 2 5 8 )
( 1 4 2 5 8 ) → ( 1 2 4 5 8 ), Swap since 4 > 2
( 1 2 4 5 8 ) → ( 1 2 4 5 8 )
( 1 2 4 5 8 ) → ( 1 2 4 5 8 )

Third pass
( 1 2 4 5 8 ) → ( 1 2 4 5 8 )
( 1 2 4 5 8 ) → ( 1 2 4 5 8 )
( 1 2 4 5 8 ) → ( 1 2 4 5 8 )
( 1 2 4 5 8 ) → ( 1 2 4 5 8 )
```
&nbsp;

> **Class:** Sorting algorithm
> **Data structure:** Array
>
> **Worst-case performance:**
>
> * `O(n²)` comparisons
> * `O(n²)` swaps
>
> **Best-case performance:**
>
> * `O(n)` comparisons
> * `O(1)` swaps
>
> **Average performance:**
>
> * `O(n²)` comparisons
> * `O(n²)` swaps
>
> **Worst-case space complexity:**
>
> * `O(n)` total
> * `O(1)` auxiliary
>
> **Optimal:** No



## Insertion Sort
---

<div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px;">
  <span style="max-width: 60%; line-height: 1.5;">
    <strong>Insertion sort</strong> iterates, consuming one input element each repetition, and grows a sorted output list. At each iteration, insertion sort removes one element from the input data, finds the correct location within the sorted list, and inserts it there. It repeats until no input elements remain.</span>
</div>

<div align="center">
	<img src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Insertion-sort-example-300px.gif" alt="Insertion Sort Animation">
	<br>
	<img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Insertionsort-before.png" alt="Before Insertion Sort" style="margin-bottom: 20px;">
	<p>Becomes</p>
	<img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Insertionsort-after.png" alt="After Insertion Sort">
</div>
<p>Example:</p>

```
3  7  4  9  5  2  6  1
3* 7  4  9  5  2  6  1
3  7* 4  9  5  2  6  1
3  4* 7  9  5  2  6  1
3  4  7  9* 5  2  6  1
3  4  5* 7  9  2  6  1
2* 3  4  5  7  9  6  1
2  3  4  5  6* 7  9  1
1* 2  3  4  5  6  7  9
```
<br>
> **Algorithm:** **Insertion Sort**
>
> **Class:** Sorting algorithm
> **Data structure:** Array
>
> **Worst-case performance:**
>
> * `O(n²)` comparisons
> * `O(n²)` swaps
>
> **Best-case performance:**
>
> * `O(n)` comparisons
> * `O(1)` swaps
>
> **Average performance:**
>
> * `O(n²)` comparisons
> * `O(n²)` swaps
>
> **Worst-case space complexity:**
>
> * `O(n)` total
> * `O(1)` auxiliary
>
> **Optimal:** No



&nbsp;

| **Algorithm**    | **Time Complexity (Best)** | **Time Complexity (Average)** | **Time Complexity (Worst)** | **Space Complexity** | **Stable** |
|-------------------|-----------------------|------------------------------|-----------------------------|---------------------|------------|
| **Bubble Sort**   | O(n)                  | O(n²)                        | O(n²)                       | O(1)                | Yes        |
| **Selection Sort**| O(n²)                 | O(n²)                        | O(n²)                       | O(1)                | No         |
| **Insertion Sort**| O(n)                  | O(n²)                        | O(n²)                       | O(1)                | Yes        |
| **Merge Sort**    | O(n log n)           | O(n log n)                  | O(n log n)                 | O(n)                | Yes        |
| **Quick Sort**    | O(n log n)           | O(n log n)                  | O(n²)                       | O(log n)            | No         |
| **Heap Sort**     | O(n log n)           | O(n log n)                  | O(n log n)                 | O(1)                | No         |
