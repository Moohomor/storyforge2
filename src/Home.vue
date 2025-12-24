<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const backendUrl = import.meta.env.VITE_BACKEND_URL
const story_id = defineModel()
const sid = ref(localStorage.getItem('sid'))

async function go() {
if (story_id.value!==NaN&&story_id.value!==undefined)
  router.push(`/play/${parseInt(story_id.value)}`);
}
async function random() {
const response = await fetch(`${backendUrl}storage/random_story`, {
      method: 'GET',
    });
router.push(`/play/${(await response.json()).id}`);
}
async function new_story() {
  const name = prompt('Введите название')
  console.log(JSON.stringify({
        sid: localStorage.getItem('sid'),
        content:"<story><module name=\"main\"></module></story>",
        name: name
      }))
  const response = await fetch(`${backendUrl}storage/new_story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sid: localStorage.getItem('sid'),
        content:'<story><module name="main"></module></story>',
        name: name
      }),
    });
  if (!response.ok) {alert('Извини, но нет')}
  else router.push(`/edit/${(await response.json()).id}`)
}
</script>
<template>
<div class="center">
    <div>
    <nav id="navPanelOne">
      <input v-model="story_id" type="number" placeholder="Введите ID новеллы" id="searchNovelInput">
      <button @click="go" id="searchBtn" ><img src="/src/components/images/searchBtn.svg" alt="Поиск" ></button>
    </nav>
    <!-- <section id="continue">
      <h2>Продолжить игру</h2>
      <div id="authContainer">
        <h3>Ой... Похоже вы еще не авторизовались.</h3>
        <input type="text" id="login" placeholder="Email или логин" class="authInput">
        <input type="password" id="password" placeholder="Пароль" class="authInput">
        <button id="logBtn">Войти</button>
        <p>Еще нет аккаунта? <span><a href="#">Создать аккаунт</a></span></p>
      </div>
    </section> -->
    <section id="novels">
      <button class="btn" @click="random">Играть случайную ></button>
    </section>
    <section v-if="sid!==null">
      <button class="btn" @click="new_story">Создать новую</button>
    </section>
  </div>
</div>
</template>
<style scoped>
.center {
  display: grid;
  place-items: center;
  min-height: 90vh;
}
#navPanelOne {
  border-radius: 5px;
}
#searchNovelInput {
  font-size: 1.5rem;
}
.btn {
  margin: 5px 0;
  width: 100%;
  padding: 10px;
  font-size: 3rem;
  background-color: black;
  color: white;
  border-radius: 5px;
}
</style>