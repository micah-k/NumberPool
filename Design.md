## Design
At first this problem sounds like a degenerate case of a memory management problem. It's reminiscent of the way Windows used to allocate BSTRings in OLE, using fixed size blocks of MAX_PATH length for all allocations that size and smaller. This is done through what is called a <a href="http://en.m.wikipedia.org/wiki/Memory_pool" target="_blank">Memory pool</a> or fixed-size block allocation. The difference here is that unlike memory management we want to manage a space larger than the memory we manage it in. So drawing some inspiration from <a href="http://en.m.wikipedia.org/wiki/Buddy_memory_allocation" target="_blank">Buddy memory allocation</a>, the first idea is to mantain a sort of <a href="http://en.m.wikipedia.org/wiki/Free_list" target="_blank">free list</a> of ranges.

Lets look at a small sample, say we are managing a NumberPool of 10 numbers. We begin with a single range containing all our numbers.
```
(1,10)->undefined
```
When the user asks for a number we merely adjust the range.
```
(1,10)->undefined
1 <= (2,10)->undefined
```
We can keep handing out numbers until we run out. 
```
(10,10)->undefined
10 <= (11,10)->undefined
```
When the user gives a number back we either add it to an existing range
```
(11,10)->undefined
10 => (10,10)->undefined
9 => (9,10)->undefined
```
or create a new range.
```
(9,10)->undefined
5 => (5,5)->(9,10)->undefined
7 => (5,5)->(7,7)->(9,10)->undefined
1 => (1,1)->(5,5)->(7,7)->(9,10)->undefined
```
Remember that we can also add to the end of an existing range as well.
```
(1,1)->(5,5)->(7,7)->(9,10)->undefined
2 => (1,2)->(5,5)->(7,7)->(9,10)->undefined
3 => (1,3)->(5,5)->(7,7)->(9,10)->undefined
```
Finally if the user adds a number to an existing range such that two consecutive ranges meet, they can be folded together.
```
(1,3)->(5,5)->(7,7)->(9,10)->undefined
4 => (1,5)->(7,7)->(9,10)->undefined
6 => (1,7)->(9,10)->undefined
8 => (1,10)->undefined
```
Allocation can be done in constant time O(1) and release can be done in linear time O(n/2) What's even worse is that the degenerate case allocating all numbers and then releasing all even numbers creates a free list with N/2 ranges, each range contains 2 numbers and a reference to the next range so the size of the degenerate case is conservative 3(N/2). Since an array of size N was explictly forbidden in the constraints this will not do.

Looking elsewhere for possible inspiration we find an Amazon interview question on <a href="http://www.careercup.com/question?id=14491683" target="_blank">Career Cup</a>. It suggests tracking the largest allocated number and then keeping releases in a <a href="http://en.wikipedia.org/wiki/Binary_heap" target="_blank">min-heap</a>. Unfortunately it is difficult to iterate (in order) over a min-heap, so we would fail to be able to detect if a number had already been released and even potentially add multiple instances of the same number to the min-heap without detecting duplicates and thus when allocated again we'd hand out duplicates.

If we changed the min-heap to a map, either a <a href="http://en.wikipedia.org/wiki/Hash_table" target="_blank">hash table</a> or a <a href="http://en.wikipedia.org/wiki/Binary_tree" target="_blank">binary tree</a> we solve the problem of detecting collisions and we get O(ln n) performance or better for release, but we still have a bad degenerate case. If all numbers are allocated and then released, our tree now has N items. We could try to optimize this by detecting if the last item in the tree is one less than the largest allocated number and if so remove it and decrement the largest allocated number. Now the degenerate case is N-1 where all but the last allocate number is released into the tree. So that is not really an optimization.

### The Solution
This brings us to our solution. We will use a heterogeneous array. Elements of the array will either be single numbers or range objects containing a start and end. We will use a binary algorithm to search this array O(ln n) during release and insert elements into the array in O(n) time. The degenerate case, allocating all numbers and releasing all even numbers will be an array of N/2 numbers. The release time of O(n) sounds bad but this is a worst case where you allocate all numbers and then release all even numbers in reverse order followed by all odd numbers in order.

Lets look at an example pool of 10 numbers.
```
[{1,10}]
```
Allocations will come off the back of the array so that all allocations will happen in O(1) time.
```
[{1,10}]
10 <= [{1,9}]
9 <= [{1,8}]
8 <= [{1,7}]
7 <= [{1,6}]
```
This also means that most releases will happen on the end of the array, minimizing copying and reducing time.
```
[{1,6}]
10 => [{1,6}, 10]
9 => [{1,6}, {9,10}]
8 => [{1,6}, {8,10}]
7 => [{1,10}]
```
