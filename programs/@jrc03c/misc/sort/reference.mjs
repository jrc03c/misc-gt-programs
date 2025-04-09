function range(a, b, s) {
  const out = []
  for (let i = a; i < b; i += s) out.push(i)
  return out
}

function iterativeMergeSort(arr) {
  const n = arr.length
  let size = 1

  while (size < n) {
    for (const left of range(0, n, 2 * size)) {
      const mid = Math.min(n, left + size)
      const right = Math.min(n, left + 2 * size)

      const left_subarray = arr.slice(left, mid)
      const right_subarray = arr.slice(mid, right)
      let i = 0
      let j = 0
      let k = left

      while (i < left_subarray.length && j < right_subarray.length) {
        if (left_subarray[i] <= right_subarray[j]) {
          arr[k] = left_subarray[i]
          i++
        } else {
          arr[k] = right_subarray[j]
          j++
        }

        k++
      }

      while (i < left_subarray.length) {
        arr[k] = left_subarray[i]
        i++
        k++
      }

      while (j < right_subarray.length) {
        arr[k] = right_subarray[j]
        j++
        k++
      }
    }

    size *= 2
  }

  return arr
}

console.log(iterativeMergeSort([2, 4, 6, 5, 3, 1]))
