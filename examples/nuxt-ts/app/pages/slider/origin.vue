<script setup lang="ts">
import "@styles/slider.css"
</script>

<template>
  <main>
    <div class="vstack gap-8">
      <SliderOrigin
        label="Balance"
        :props="{ name: 'balance', origin: 'center', min: -50, max: 50, defaultValue: [20] }"
        :format="(value: number) => (value === 0 ? 'Center' : `${value < 0 ? 'L' : 'R'} ${Math.abs(value)}`)"
      />
      <SliderOrigin
        label="Exposure"
        :props="{ name: 'exposure', origin: 0, min: -3, max: 1, step: 0.1, defaultValue: [-1.5] }"
        :format="(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)} EV`"
        :marks="[-3, -2, -1, 0, 1]"
      />
      <SliderOrigin
        label="Fade out"
        :props="{ name: 'fade-out', origin: 'end', defaultValue: [70] }"
        :format="(value: number) => `${100 - value}%`"
      />
    </div>
  </main>
</template>
