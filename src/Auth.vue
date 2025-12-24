<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const backendUrl = import.meta.env.VITE_BACKEND_URL

const router = useRouter();
const username = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    const response = await fetch(`${backendUrl}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        login: username.value,
        password: password.value,
      }),
    });

    if (!response.ok) {
      if (response.status == 403) {
        alert('Неправильный логин или пароль')
        return
      }
      throw new Error('Login failed');
    }

    const data = await response.json();

    localStorage.setItem('sid', data.sid);
    router.push('/');
    
  } catch (error) {
    console.error("Error during login:", error.message);
    alert("Invalid credentials or server error");
  }
}
</script>
<template>
    <h1 class="AuthH1">Вход</h1>
    <div class="AuthContainer">
        <form method="POST" @submit.prevent="handleLogin">
            <label for="login">Логин</label>
            <input v-model="username" type="text" id="login" name="login" required="" placeholder="Введите логин"></input>
            <label id="pasLb" for="password">Пароль</label>
            <input v-model="password" type="password" id="password" name="password" required="" placeholder="Введите пароль" minlength="6"></input>
            <button type="submit" class="authBtn">Войти</button>
        </form>
        <p>Еще нет аккаунта? <a href="/register">Создать аккаунт</a></p>
    </div>
</template>