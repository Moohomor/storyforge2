<template>
  <div class="choice d-flex justify-content-center align-items-center min-vh-100">
    <div class="container">
      <div class="mb-2">
        <button class="question" disabled>
          {{ question }}
        </button>
      </div>
      <div v-for="(answer, index) in answers" :key="index" class="mb-2">
        <button class="answer" @click="selectAnswer(index)">
          {{ answer }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['answers'])
const emit = defineEmits(['answerSelected'])

const answersList = computed(() => props.answers.split(';'))
const question = computed(() => answersList.value[0] || '')
const answers = computed(() => answersList.value.slice(1))

function selectAnswer(answer) {
  emit('return', answer)
}
</script>
<style>
.container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: flex-start;
}
.container * {
  color: var(--white);
  background-color: rgba(0, 0, 0, .1);
}
.answer {
  font-size: 2rem;
}
.question {
  font-size: 4rem;
}
</style>