<template>
  <div
    class="z-10 cursor-pointer whitespace-nowrap py-4 text-center text-base-content opacity-50 transition-opacity hover:opacity-100 lg:py-2"
  >
    <span class="material-symbols-outlined"> expand_less </span>
    {{ $inputMechanism.isCoarse ? "Tap" : "Press esc or click" }} here to close
    <span class="material-symbols-outlined"> expand_less </span>
  </div>
</template>
