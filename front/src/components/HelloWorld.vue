<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3 class="text-3xl font-bold underline underline-offset-8">
      You’ve successfully created a project with Vite + Vue 3
    </h3>
  </div>
</template>

<style scoped>

</style>
