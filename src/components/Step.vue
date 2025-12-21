<script setup>
import { defineProps, ref, onMounted } from 'vue'
const props = defineProps({
  json: {
    type: Object,
    required: true
  }
})

const tag = ref(props.json.tag)
const closing = ref(tag.value[0]=='/')
const tags = [['Text', 'tx'], ['Sprite', 'sprite'], ['Background', 'bg'], ['Character', 'char'], ['Choice','choice'], ['Step', 'step'], ['If condition', 'if'], ['Else', 'else'], ['Go to module', 'go'], ['Set variable value', 'set']]

onMounted(() => {
  if (closing.value)
      tag.value = tag.value.substring(1)
})
</script>

<template>
<div class="step">
  <div class="space">
    <span v-for="n in props.json.spaces/2" />
  </div>
  <p v-if="props.json.closing">End of</p>
  <div v-if="tag == 'module'">
    <h3>Module</h3>
    <input type="text" name="module" v-model="props.json.attributes.name.nodeValue">
  </div>
  <select name="tag" v-model="tag" v-else>
    <option v-for="option in tags" :key="option[1]" :value="option[1]">
        {{ option[0] }}
    </option>
  </select>
  <input :value="props.json.content" v-if="['tx', 'bg', 'char', 'sprite'].includes(tag)"/>
</div>  
</template>

<style>
.step {
  display: flex;
  flex: 1;
  gap: 5px;
  background-color: var(--dark_gray);
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.2);
  color: var(--black);
  border: 1px solid var(--light_gray);
  border-radius: 4px;
  margin-bottom: 2px;
  padding: 0 10px;
  width: fit-content;
}
.step > * {
  margin: 10px 0;
}
.space {
  width: fit-content;
  margin: 0 0;
}
.space > * {
  display: inline-block;
  width: 1px;
  height: 100%;
  margin-right: 5px;
  background-color: var(--semi_light_gray);
}
</style>