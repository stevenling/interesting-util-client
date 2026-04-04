<template>
  <section class="w-full max-w-4xl mx-auto px-6 py-10">
    <h2
      class="text-xl font-medium mb-6 text-slate-800 dark:text-slate-100 border-l-2 border-blue-600 dark:border-blue-500 pl-3"
    >
      {{ title }}
    </h2>

    <div
      class="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 [&>*]:min-w-0 [&>*]:w-full"
    >
      <ToolCard
        v-for="item in list"
        :key="item.title"
        :title="item.title"
        :desc="item.desc"
        :link="item.link"
      />
    </div>
  </section>
</template>

<script setup>
import ToolCard from './ToolCard.vue'

defineProps({
  title: String,
  list: {
    type: Array,
    default: () => [],
  },
})
</script>
