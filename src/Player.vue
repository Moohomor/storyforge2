<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const backendUrl = import.meta.env.VITE_BACKEND_URL
const rawXML = ref('')
const tree = ref(null)
const nvars = reactive({choice: -1})
const vars = reactive({'Engine.text': '', 'Engine.char': '', 'Engine.bg_name': ''})
const state = ref(null)
const answers = ref('')

onMounted(async () => {
	// const resp = await fetch(`${backendUrl}storage/story_content`, {
	// 	method:'PUT',
	// 	headers: {
	// 		'Accept': 'application/json',
	// 		'Content-Type': 'application/json' // This is crucial
	// 	},
	// 	body: JSON.stringify({
	// 				"id": parseInt(route.params.id)
	// 			})
	// })
	// rawXML.value = (await resp.json()).content
	rawXML.value = `
<story>
  <module name="main">
    <step>
      <char>Daun</char>
      <tx>lll</tx>
    </step>
    <set a="1"></set>
    <if condition="a==1">
      <step>
        <char>Megadaun</char>
        <tx>Not now</tx>
      </step>
    </if>
    <else>
      <step>
        <tx>Yep!</tx>
      </step>
    </else>
    <step>
      <char></char>
      <tx>Got it</tx>
    </step>
    <go to="second"></go>
    <step>
      <tx>Come back</tx>
    </step>
  </module>
  <module name="second">
    <step>
      <char>Not daun</char>
      <tx>not lll</tx>
    </step>
  </module>
</story>
`
	tree.value = new DOMParser().parseFromString(rawXML.value, 'text/xml')
	const error = tree.value.querySelector('parsererror')
	if (error) {
		console.error("Couldn't parse XML:\n", error.textContent)
		alert('Не удалось запустить игру. Причина: проб...Показать больше')
		return
	}

	console.log(tree.value.children[0])
})
</script>

<template>
	<div :style="{background: `url('https://media.greatbigphotographyworld.com/wp-content/uploads/2014/11/Landscape-Photography-steps.jpg')`}">
		<div class="dialogue-box"></div>
	</div>
</template>

<style>
.dialogue-box {
	hyphens: auto;
	word-break: normal;
	position: absolute;
	bottom: 0;
	width: 100%;
	background-color: rgba(0, 0, 0, .9);
	color: white;
	padding: 1rem;
}
</style>