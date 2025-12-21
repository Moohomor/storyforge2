<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Step from "./components/Step.vue"

const route = useRoute()
const backendUrl = import.meta.env.VITE_BACKEND_URL

function countLeadingSpaces(str) {
  const match = str.match(/^\s*/);
  // match[0] will contain the leading whitespace string
  // If no match is found (e.g., empty string), it still works
  return match[0].length;
}

async function downloadStory() {
  const sid = localStorage.getItem('sid')
  const storyId = route.params.id
  
  try {
    const response = await fetch(`${backendUrl}storage/story_content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parseInt(storyId),
        sid: sid
      })
    })
    
    if (!response.ok) throw new Error('Failed to load story')
    
    const data = await response.json()
    // Предполагаем, что контент в поле 'content'
    return data.content || data
  } catch (error) {
    console.error('Error loading story:', error)
    throw error
  }
}

function parseXML(xmlString) {
  return new DOMParser().parseFromString(xmlString, 'text/xml')
}
function serializeXML(xml) {
  return new XMLSerializer().serializeToString(xml)
}
function XMLtoJSON(xml) {
  const start = xml.trim().substring(1, xml.trim().indexOf('>'))
  const end = xml.trim().substring(xml.trim().lastIndexOf('<')+1, xml.trim().length-1)
  let props = {}
  const parsedXML = parseXML(xml+`</${start.substring(0, start.indexOf(' '))}>`)
  // console.log(xml+`</${start.substring(0, start.indexOf(' '))}>`)
  // console.log(parsedXML.children[0].attributes)
  if (!parsedXML.querySelector('parsererror'))
    props.attributes = parsedXML.children[0].attributes
  if (start != end) {
    // console.log(`${xml} - ${xml.substring(xml.indexOf('>')+1, xml.lastIndexOf('<'))}`)
    // console.log(`${start} ${end}`)
    props.single = false
    props.content = xml.trim().substring(xml.trim().indexOf('>')+1, xml.trim().lastIndexOf('<'))
  } else {
    // console.log(start)
    props.single = true
    props.closing = start.startsWith('/')
    props.content = ""
  }
  return {
    start: start,
    end: end,
    tag: (start.includes(' ')?start.substring(0, start.indexOf(' ')):start.substring(start.indexOf('>'))),
    spaces: countLeadingSpaces(xml),
    ...props
  }
}

function JSONtoXML(obj) {
  return `${' '.repeat(obj.spaces)}<${obj.tag}>${obj.content}${obj.single?'':'</'+obj.tag+'>'}`
}

const mods = ref({})

onMounted(async () => {
  const xml = await downloadStory()
  for (const i of parseXML(xml).children[0].children) {
    let t = []
    for (const j of serializeXML(i).split('\n')) {
      t.push(XMLtoJSON(j))
    }
    console.log(t[0].attributes.name.nodeValue)
    mods.value[t[0].attributes.name.nodeValue] = t
  }
  for (const i of Object.values(mods.value)) {
    for (const j of i) {
      console.log(JSONtoXML(j))
    }
  }
})
</script>

<template>
  <div class="wrapper">
    <ul class="mods-list">
      <li v-for="mod in mods">
        <ul class="steps-list">
          <li v-for="json in mod">
            <Step :json="json"/>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style>
ul {
  list-style-type: none;
}
.wrapper {
  width: 100%;
  overflow-x: scroll;
}
.mods-list {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin: 20px auto;
  width: fit-content;
}
.steps-list {
  display: block;
  padding-left: 0;
}
.steps-list > li {
  display: flex;
}
</style>