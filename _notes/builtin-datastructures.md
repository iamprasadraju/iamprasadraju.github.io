---
title: "In-built Datastructures in py, c++, c"
date: "8 Mar 2026"
summary: "Complete reference for built-in data structures in Python, C++, and C with code examples"
tags:
  - "Data Structures"
  - "Python"
  - "C++"
  - "C"
---

{% raw %}
# Built-in Data Structures - Complete Reference

A quick reference for common data structure operations. Use this as your go-to guide.

---

## Table of Contents

### Python
[List](#list) | [Tuple](#tuple) | [Set](#set) | [Dictionary](#dictionary) | [Array](#array-module) | [Collections](#collections)

### C++ (STL)
[Vector](#vector) | [Deque](#deque) | [List](#list-cpp) | [Array](#array-cpp) | [Stack](#stack) | [Queue](#queue) | [Priority Queue](#priority-queue) | [Set](#set-cpp) | [Multiset](#multiset) | [Map](#map) | [Multimap](#multimap) | [Unordered Set](#unordered-set) | [Unordered Map](#unordered-map) | [String](#string-cpp) | [Pair/Tuple](#pair-tuple)

### C Language
[Array](#array-c) | [String](#string-c) | [Struct](#struct) | [Union](#union) | [Enum](#enum) | [Pointer](#pointer) | [Linked List](#linked-list)

---

## <a name="python"></a>Python

### <a name="list"></a>List []
**Definition:** Ordered, mutable sequence that allows duplicate elements. Elements are indexed starting from 0. Supports dynamic resizing.

| Operation | Time | Space |
|-----------|------|-------|
| Access by index | O(1) | - |
| Append | O(1)* | - |
| Insert at index | O(n) | O(1) |
| Remove at index | O(n) | - |
| Remove by value | O(n) | - |
| Search | O(n) | - |
| Sort | O(n log n) | O(n) |

*Amortized

```python
# Creation
lst = [1, 2, 3]
lst = list(range(5))
lst = [0] * 5           # [0, 0, 0, 0, 0]

# Add
lst.append(x)           # O(1) - add to end
lst.insert(i, x)        # O(n) - insert at index
lst.extend(iterable)    # O(k) - add multiple

# Remove
lst.pop()              # O(1) - remove last
lst.pop(i)              # O(n) - remove at index
lst.remove(x)           # O(n) - remove first occurrence
lst.clear()             # O(n)

# Access
lst[i]                 # O(1)
lst[-1]                # last element

# Search
lst.index(x)           # O(n) - first index
lst.count(x)           # O(n) - count
x in lst               # O(n) - membership

# Sort/Reverse
lst.sort()             # O(n log n)
sorted(lst)            # O(n log n)
lst.reverse()          # O(n)
lst[::-1]              # O(n) - reversed copy

# Stack using list
stack = []
stack.append(1)    # push - O(1)
stack.pop()        # pop - O(1)
stack[-1]          # peek - O(1)
```

**Interview Questions:**

Q: When would you use list instead of array?
A: Use list when you need dynamic sizing, mixed types, or built-in methods. Use array module when you need memory efficiency for large numeric data of the same type.

Q: What is the time complexity of `append()` vs `insert()`?
A: append() is O(1) amortized - adds to end. insert() is O(n) - requires shifting all elements.

Q: How does list handle dynamic resizing?
A: Python list uses over-allocation. When full, allocates ~12.5% more space. This amortizes resize cost to O(1) for append.

Q: Difference between `remove()` and `pop()`?
A: remove() removes first occurrence of value (O(n)), raises ValueError if not found. pop() removes and returns element at index.

Q: How would you implement a stack using list?
A: Use append() for push, pop() for pop. Top of stack is last element.

---

### <a name="tuple"></a>Tuple ()
**Definition:** Ordered, immutable sequence. Once created, cannot be modified. Used for fixed collections.

| Operation | Time | Space |
|-----------|------|-------|
| Access by index | O(1) | - |
| Search | O(n) | - |
| Length | O(1) | - |

```python
# Creation
t = (1, 2, 3)
t = 1, 2, 3           # parentheses optional
t = (1,)              # single element needs comma
t = tuple([1, 2, 3])

# Access - same as list
t[0], t[-1], t[1:3]

# Unpack
a, b, c = t
first, *rest = t      # rest is [2, 3]

# Operations
len(t), t.index(x), t.count(x)

# Tuple as dict key
d = {(1, 2): "point"}

# Multiple return values
def func():
    return 1, 2
a, b = func()
```

**Interview Questions:**

Q: Why is tuple immutable? What are the benefits?
A: Immutability provides hashability (can be dict keys), memory efficiency, and thread safety.

Q: Can tuple contain mutable objects? What happens?
A: Yes, tuple can contain mutable objects like lists. The tuple itself can't change, but contents can.

Q: Difference between tuple and list?
A: Tuple is immutable (faster, less memory, hashable), used for fixed data. List is mutable.

Q: How does tuple hash work?
A: Only works if all elements are hashable. Hash is computed from contents.

Q: Use cases where tuple is preferred over list?
A: Function return values, dictionary keys, fixed records (coordinates).

---

### <a name="set"></a>Set {}
**Definition:** Unordered collection of unique elements. No duplicates. Provides O(1) average-case lookup.

| Operation | Time (Avg) | Time (Worst) | Space |
|-----------|-------------|---------------|-------|
| Add | O(1) | O(n) | - |
| Remove | O(1) | O(n) | - |
| Search/Membership | O(1) | O(n) | - |
| Union | O(n+m) | - | O(n+m) |
| Intersection | O(min(n,m)) | O(n*m) | - |

```python
# Creation
s = {1, 2, 3}
s = set([1, 2, 3])
s = set()             # empty set (not {})

# Add/Remove
s.add(x)             # O(1)
s.remove(x)           # O(1) - raises KeyError if not found
s.discard(x)          # O(1) - no error if not found
s.pop()               # O(1) - remove random element

# Set operations
A | B                 # union - O(n+m)
A & B                 # intersection - O(min(n,m))
A - B                 # difference - O(n)
A ^ B                 # symmetric difference - O(n+m)

# Common elements
list1 = [1, 2, 3, 4]
list2 = [3, 4, 5, 6]
common = list(set(list1) & set(list2))

# Remove duplicates, preserve order
lst = [1, 2, 2, 3, 1, 4]
unique = list(dict.fromkeys(lst))
```

**Interview Questions:**

Q: How is set implemented internally in Python?
A: Python set uses a hash table. Elements are hashed, collisions handled using open addressing.

Q: What is the difference between set and frozenset?
A: set is mutable, frozenset is immutable and hashable.

Q: How to find common elements between two lists?
A: Convert both to sets and use intersection.

Q: Why set doesn't support indexing?
A: Sets are hash tables - order is determined by hash values.

Q: How would you remove duplicates from a list while preserving order?
A: Use dict.fromkeys() or loop through with seen set.

---

### <a name="dictionary"></a>Dictionary {}
**Definition:** Collection of key-value pairs where each key is unique. Provides O(1) average-case lookup.

| Operation | Time (Avg) | Time (Worst) | Space |
|-----------|-------------|---------------|-------|
| Access by key | O(1) | O(n) | - |
| Insert | O(1) | O(n) | - |
| Delete | O(1) | O(n) | - |
| Search | O(1) | O(n) | - |
| Get | O(1) | O(n) | - |

```python
# Creation
d = {'a': 1, 'b': 2}
d = dict(a=1, b=2)
d = dict(zip(keys, values))

# Access
d['key']              # O(1) - raises KeyError if missing
d.get('key')          # O(1) - returns None
d.get('key', default) # O(1) - returns default

# Add/Update
d['key'] = value     # O(1)
d.update({'k1': v1, 'k2': v2})  # O(k)

# Remove
del d['key']          # O(1)
value = d.pop('key') # O(1)
d.popitem()           # O(1) - removes last item

# defaultdict
from collections import defaultdict
dd = defaultdict(list)
dd['key'].append(1)

# Merge (Python 3.9+)
d3 = d1 | d2
```

**Interview Questions:**

Q: How is dictionary implemented in Python?
A: Python dict uses a hash table with open addressing. Uses hash to compute index, handles collisions via probing.

Q: What is hash collision and how does Python handle it?
A: When two keys hash to same index. Python uses open addressing - probes for next empty slot.

Q: Difference between `get()` and `[]`?
A: get() returns None/default if key not found. [] raises KeyError.

Q: How does dictionary maintain insertion order (Python 3.7+)?
A: Python 3.7+ maintains insertion order using compact array.

Q: What is the difference between dict and collections.defaultdict?
A: Regular dict raises KeyError for missing keys. defaultdict provides default values.

Q: How would you merge two dictionaries in Python?
A: Use | operator (Python 3.9+), update(), or {**d1, **d2}.

---

### <a name="array-module"></a>Array (array module)
**Definition:** Homogeneous array of numeric values stored more efficiently than lists.

| Operation | Time | Space |
|-----------|------|-------|
| Access by index | O(1) | - |
| Append | O(1)* | - |
| Insert | O(n) | - |
| Delete | O(n) | - |

*Amortized

```python
from array import array

# Type codes: 'b','B','h','H','i','I','f','d'
arr = array('i', [1, 2, 3])
arr.append(4)    # O(1)
arr[0]           # O(1)
```

---

### <a name="collections"></a>Collections Module

**deque:** Double-ended queue - O(1) add/remove at both ends

| Operation | Time |
|-----------|------|
| appendleft | O(1) |
| appendright | O(1) |
| popleft | O(1) |
| popright | O(1) |
| rotate | O(k) |

```python
from collections import deque
dq = deque([1, 2, 3])
dq.appendleft(0)      # O(1)
dq.appendright(4)    # O(1)
dq.popleft()         # O(1)
dq.rotate(n)          # O(k)
```

**Counter:** Count hashable items

| Operation | Time |
|-----------|------|
| Access | O(1) |
| Most common | O(n log k) |

```python
from collections import Counter
c = Counter(['a', 'b', 'a', 'c', 'a'])
c['a']                # O(1) - 3
c.most_common(2)     # O(n log k)
```

**namedtuple:** Tuple with named fields

```python
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(1, 2)
p.x, p.y             # O(1)
```

**defaultdict:** Dict with default values - same complexity as dict

```python
from collections import defaultdict
dd = defaultdict(int)
dd['key'].append(1)  # O(1)
```

---

## <a name="cpp"></a>C++ (STL)

### <a name="vector"></a>Vector `<vector>`
**Definition:** Dynamic array that can resize automatically. Provides random access.

| Operation | Time | Space |
|-----------|------|-------|
| Access by index | O(1) | - |
| push_back | O(1)* | - |
| pop_back | O(1) | - |
| insert at position | O(n) | - |
| erase at position | O(n) | - |
| Search | O(n) | - |
| Sort | O(n log n) | O(n) |

*Amortized

```cpp
#include <vector>
using namespace std;

vector<int> v;
vector<int> v = {1, 2, 3};
vector<int> v(5);
vector<int> v(5, 10);

v[i], v.at(i)           // O(1)
v.front(), v.back()     // O(1)
v.push_back(x);         // O(1)*
v.pop_back();           // O(1)
v.insert(it, x);        // O(n)
v.erase(it);            // O(n)
v.size(), v.empty()     // O(1)
v.capacity()           // O(1)
v.reserve(n);          // O(n)
```

**Interview Questions:**

Q: What is amortized O(1) for push_back?
A: Most push_back calls are O(1), but occasionally reallocates and copies all elements. This rare cost is amortized.

Q: Difference between vector and array?
A: Array has fixed size at compile time. Vector has dynamic size.

Q: When should you use reserve()?
A: When you know approximate size beforehand. Prevents multiple reallocations.

Q: Capacity vs size?
A: size = elements. capacity = memory allocated. size <= capacity.

---

### <a name="deque"></a>Deque `<deque>`
**Definition:** Double-ended queue allowing O(1) insertion/deletion at both front and back.

| Operation | Time |
|-----------|------|
| push_front | O(1) |
| push_back | O(1) |
| pop_front | O(1) |
| pop_back | O(1) |
| Access | O(1) |
| Insert at position | O(n) |

```cpp
#include <deque>
using namespace std;

deque<int> dq = {1, 2, 3};
dq.push_front(0);      // O(1)
dq.push_back(4);       // O(1)
dq.pop_front();        // O(1)
dq.pop_back();         // O(1)
dq[0], dq.at(0)       // O(1)
```

**Interview Questions:**

Q: How is deque different from vector?
A: Deque allows O(1) at both ends. Vector only at back.

Q: Internal structure?
A: Uses multiple fixed-size arrays (chunks) mapped together.

---

### <a name="list-cpp"></a>List `<list>`
**Definition:** Doubly linked list with O(1) insertion/deletion anywhere. No random access.

| Operation | Time |
|-----------|------|
| push_front | O(1) |
| push_back | O(1) |
| pop_front | O(1) |
| pop_back | O(1) |
| insert at iterator | O(1) |
| erase at iterator | O(1) |
| Access by index | O(n) |
| Search | O(n) |

```cpp
#include <list>
using namespace std;

list<int> lst = {1, 2, 3};
lst.push_front(0);           // O(1)
lst.push_back(4);            // O(1)
lst.insert(++lst.begin(), 5); // O(1) with iterator
lst.remove(2);               // O(n)
lst.reverse();              // O(n)
lst.sort();                 // O(n log n)
```

**Interview Questions:**

Q: When to use list over vector?
A: When frequent insertion/deletion in middle, or at front.

Q: Time complexity of inserting in middle?
A: O(1) if you have iterator. O(n) to find position.

---

### <a name="array-cpp"></a>Array `<array>`
**Definition:** Fixed-size container wrapping C-style array.

| Operation | Time |
|-----------|------|
| Access | O(1) |
| fill | O(n) |

```cpp
#include <array>
using namespace std;

array<int, 5> arr = {1, 2, 3, 4, 5};
arr[0], arr.at(0)      // O(1)
arr.fill(0);          // O(n)
arr.size()            // O(1) - compile time
```

---

### <a name="stack"></a>Stack `<stack>`
**Definition:** LIFO adapter with push, pop, top operations.

| Operation | Time |
|-----------|------|
| push | O(1) |
| pop | O(1) |
| top | O(1) |
| empty | O(1) |
| size | O(1) |

```cpp
#include <stack>
using namespace std;

stack<int> st;
st.push(x);         // O(1)
st.top();          // O(1)
st.pop();          // O(1)
st.empty();        // O(1)
st.size();         // O(1)
```

**Interview Questions:**

Q: Basic operations of stack?
A: push, pop, top, empty, size - all O(1).

Q: Applications of stack?
A: DFS, expression evaluation, parenthesis matching, undo/redo.

---

### <a name="queue"></a>Queue `<queue>`
**Definition:** FIFO adapter with enqueue at back, dequeue at front.

| Operation | Time |
|-----------|------|
| push | O(1) |
| pop | O(1) |
| front | O(1) |
| back | O(1) |
| empty | O(1) |
| size | O(1) |

```cpp
#include <queue>
using namespace std;

queue<int> q;
q.push(x);          // O(1)
q.front();         // O(1)
q.back();          // O(1)
q.pop();           // O(1)
q.empty();         // O(1)
q.size();          // O(1)
```

**Interview Questions:**

Q: Applications of queue?
A: BFS, task scheduling, print job queue.

---

### <a name="priority-queue"></a>Priority Queue `<queue>`
**Definition:** Heap-based, max/min element at top.

| Operation | Time |
|-----------|------|
| push | O(log n) |
| pop | O(log n) |
| top | O(1) |
| empty | O(1) |
| size | O(1) |

```cpp
#include <queue>
using namespace std;

priority_queue<int> pq;
priority_queue<int, vector<int>, greater<int>> pq;

pq.push(x);        // O(log n)
pq.top();         // O(1)
pq.pop();         // O(log n)
```

**Interview Questions:**

Q: Time complexity of push and pop?
A: Both O(log n).

Q: Applications?
A: Dijkstra's, Huffman coding, top-k elements.

---

### <a name="set-cpp"></a>Set `<set>`
**Definition:** Sorted unique elements. Red-Black tree.

| Operation | Time |
|-----------|------|
| insert | O(log n) |
| erase | O(log n) |
| find | O(log n) |
| count | O(log n) |
| lower_bound | O(log n) |
| upper_bound | O(log n) |

```cpp
#include <set>
using namespace std;

set<int> s = {3, 1, 4, 1, 5, 9};
s.insert(x);                    // O(log n)
s.erase(x);                     // O(log n)
s.find(x) != s.end()           // O(log n)
s.count(x)                      // O(log n)
s.lower_bound(x)              // O(log n)
s.upper_bound(x)              // O(log n)
```

**Interview Questions:**

Q: Time complexity?
A: All operations O(log n) due to tree structure.

---

### <a name="multiset"></a>Multiset `<multiset>`
**Definition:** Sorted container allowing duplicate elements.

| Operation | Time |
|-----------|------|
| insert | O(log n) |
| erase | O(log n)* |
| find | O(log n) |
| count | O(log n + k) |

*Each occurrence

```cpp
#include <set>
using namespace std;

multiset<int> ms = {1, 2, 2, 3};
ms.insert(2);       // O(log n)
ms.count(2);      // O(log n + k)
```

---

### <a name="map"></a>Map `<map>`
**Definition:** Sorted key-value pairs. Red-Black tree.

| Operation | Time |
|-----------|------|
| insert | O(log n) |
| erase | O(log n) |
| find | O(log n) |
| access by key | O(log n) |
| operator[] | O(log n) |
| at() | O(log n) |

```cpp
#include <map>
using namespace std;

map<string, int> m;
m["key"] = value;              // O(log n)
m.at("key");                   // O(log n)
m.insert({"key", value});     // O(log n)
m.find("key") != m.end()      // O(log n)
m.erase("key");                // O(log n)
for(auto [k, v] : m) {}       // O(n)
```

**Interview Questions:**

Q: vs unordered_map?
A: map is O(log n) sorted. unordered_map is O(1) average.

---

### <a name="multimap"></a>Multimap `<multimap>`
**Definition:** Sorted key-value pairs allowing duplicate keys.

| Operation | Time |
|-----------|------|
| insert | O(log n) |
| erase | O(log n) |
| find | O(log n) |
| equal_range | O(log n + k) |

```cpp
#include <map>
using namespace std;

multimap<string, int> mm;
mm.insert({"fruit", 1});       // O(log n)
mm.insert({"fruit", 2});      // O(log n)
mm.equal_range("fruit");     // O(log n + k)
```

---

### <a name="unordered-set"></a>Unordered Set `<unordered_set>`
**Definition:** Hash-based set. O(1) average lookup.

| Operation | Time (Avg) | Time (Worst) |
|-----------|------------|---------------|
| insert | O(1) | O(n) |
| erase | O(1) | O(n) |
| find | O(1) | O(n) |
| count | O(1) | O(n) |

```cpp
#include <unordered_set>
using namespace std;

unordered_set<int> us = {3, 1, 4, 5};
us.insert(x);                  // O(1) avg
us.find(x) != us.end()       // O(1) avg
us.erase(x);                  // O(1) avg
```

**Interview Questions:**

Q: Load factor?
A: Ratio of elements to buckets. Lower = less collisions, more memory.

---

### <a name="unordered-map"></a>Unordered Map `<unordered_map>`
**Definition:** Hash-based map. O(1) average lookup.

| Operation | Time (Avg) | Time (Worst) |
|-----------|------------|---------------|
| insert | O(1) | O(n) |
| erase | O(1) | O(n) |
| find | O(1) | O(n) |
| access | O(1) | O(n) |

```cpp
#include <unordered_map>
using namespace std;

unordered_map<string, int> um;
um["key"] = value;            // O(1) avg
um.at("key");                 // O(1) avg
um.find("key") != um.end()  // O(1) avg
```

**Interview Questions:**

Q: Hash collisions?
A: Uses chaining or probing. Falls back to rehashing.

---

### <a name="pair-tuple"></a>Pair & Tuple

| Operation | Time |
|-----------|------|
| Access | O(1) |
| Make | O(1) |

```cpp
#include <utility>
#include <tuple>

pair<int, string> p = {1, "hello"};
p.first, p.second              // O(1)

tuple<int, string, double> t = {1, "hi", 2.5};
get<0>(t)                     // O(1)
tie(a, b, c) = t;            // O(k)
```

---

### <a name="string-cpp"></a>String `<string>`

| Operation | Time |
|-----------|------|
| Access | O(1) |
| Concatenate | O(n+m) |
| Substring | O(m) |
| Find | O(n*m) |
| Replace | O(n+m) |
| Size/Length | O(1) |

```cpp
#include <string>
using namespace std;

string s = "hello";
s += " world";               // O(m) amortized
s.size(), s.length()        // O(1)
s.find("lo")               // O(n*m)
s.substr(2, 3)            // O(m)
s.replace(0, 5, "bye")     // O(n+m)
```

---

## <a name="c-lang"></a>C Language

### <a name="array-c"></a>Array
**Definition:** Contiguous memory block with elements of same type. Fixed size.

| Operation | Time | Notes |
|-----------|------|-------|
| Access by index | O(1) | Formula: base + index * size |
| Search | O(n) | Linear |
| Sort | O(n log n) | Requires algorithm |

```c
int arr[5];
int arr[5] = {1, 2, 3, 4, 5};
int arr[] = {1, 2, 3};

arr[0] = 10;          // O(1)
int x = arr[4];       // O(1)

int matrix[2][3] = {{1,2,3}, {4,5,6}};

void func(int *arr, int size) {}
#define ARRAY_SIZE(arr) (sizeof(arr)/sizeof(arr[0]))
```

**Interview Questions:**

Q: Contiguous memory enables?
A: O(1) random access, good cache locality.

Q: Array decay?
A: Array decays to pointer when passed, loses size info.

---

### <a name="string-c"></a>String
**Definition:** Null-terminated character array.

| Operation | Time |
|-----------|------|
| Access char | O(1) |
| strlen | O(n) |
| strcpy | O(n) |
| strcat | O(n+m) |
| strcmp | O(n) |
| strchr | O(n) |
| strstr | O(n*m) |

```c
#include <string.h>

char s[] = "hello";
char *s = "hello";

strlen(s)                  // O(n)
strcpy(dest, src)         // O(n)
strcat(dest, src)         // O(n+m)
strcmp(s1, s2)            // O(n)
strncpy(dest, src, n)     // O(n)
```

**Interview Questions:**

Q: Buffer overflow?
A: Writing beyond array bounds, security vulnerability.

Q: Safe copy?
A: Use strncpy with null termination, or snprintf.

---

### <a name="struct"></a>Struct
**Definition:** Composite type grouping different types.

| Operation | Time |
|-----------|------|
| Access member | O(1) |
| Copy | O(n) |
| Size | O(1) |

```c
struct Point {
    int x;
    int y;
};

struct Point p1 = {1, 2};
p1.x = 10;                 // O(1)

typedef struct {
    int x;
    int y;
} Point;
```

**Interview Questions:**

Q: Padding?
A: Compiler adds padding for alignment. Size may be larger.

---

### <a name="union"></a>Union
**Definition:** All members share same memory location.

```c
union Data {
    int i;
    float f;
    char c;
};

union Data d;
d.i = 10;                  // O(1)
```

---

### <a name="enum"></a>Enum
**Definition:** Named integer constants.

```c
enum Day {SUN, MON, TUE};
enum Color {RED = 1, GREEN = 2};
```

---

### <a name="pointer"></a>Pointer
**Definition:** Variable storing memory address.

| Operation | Time |
|-----------|------|
| Dereference | O(1) |
| Address-of | O(1) |
| Arithmetic | O(1) |
| malloc | O(1)* |
| free | O(1) |
| realloc | O(n)* |

*Amortized

```c
int x = 10;
int *p = &x;              // O(1)
*p = 20;                  // O(1)

int *arr = malloc(n * sizeof(int));  // O(1)*
free(arr);                 // O(1)

void alloc(int **p) {
    *p = malloc(sizeof(int));  // O(1)*
}
```

**Interview Questions:**

Q: malloc vs calloc?
A: malloc: uninitialized. calloc: zero-initialized.

Q: Memory leak?
A: Memory allocated but never freed.

---

### <a name="linked-list"></a>Linked List (manual)

| Operation | Time |
|-----------|------|
| Insert at head | O(1) |
| Insert at tail | O(1)* |
| Delete at head | O(1) |
| Search | O(n) |
| Access by index | O(n) |

*If tail pointer maintained

```c
struct Node {
    int data;
    struct Node *next;
};

struct Node *new = malloc(sizeof(struct Node));
new->data = 1;
new->next = head;
head = new;

for(struct Node *p = head; p; p = p->next)
    printf("%d ", p->data);
```

---

## Quick Reference

| Need | Python | C++ | C |
|------|--------|-----|---|
| Sequence, index | list | vector | array |
| Both ends | deque | deque | manual |
| Unique | set | unordered_set | - |
| Key-value | dict | unordered_map | - |
| Sorted | set | set | - |
| Stack | list/stack | stack | manual |
| Queue | deque | queue | manual |
| Priority | heapq | priority_queue | manual |

---

## Complexity Summary

### Python

| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| list | O(1) | O(n) | O(1)* | O(n) |
| tuple | O(1) | O(n) | N/A | N/A |
| set | - | O(1)* | O(1)* | O(1)* |
| dict | - | O(1)* | O(1)* | O(1)* |

*Average **Worst case

### C++ STL

| Container | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| vector | O(1) | O(n) | O(1)* | O(n) |
| deque | O(1) | O(n) | O(1) | O(1) |
| list | O(n) | O(n) | O(1) | O(1) |
| set/map | - | O(log n) | O(log n) | O(log n) |
| unordered_set/map | - | O(1)* | O(1)* | O(1)* |

*Average **Worst case

### C

| Structure | Access | Search | Notes |
|-----------|--------|--------|-------|
| array | O(1) | O(n) | Fixed size |
| linked list | O(n) | O(n) | Dynamic |

{% endraw %}
