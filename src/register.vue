<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const backendUrl = import.meta.env.VITE_BACKEND_URL

const router = useRouter();
const username = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    const response = await fetch(`${backendUrl}auth/reg`, {
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
      console.error(await response.json())
      throw new Error('Reg failed');
    }

    

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
          throw new Error('Login failed');
        }

        const data = await response.json();

        localStorage.setItem('sid', data.sid);
        router.push('/');

    } catch (error) {
        console.error("Error during login:", error.message);
        alert("Invalid credentials or server error");
    }

    
  } catch (error) {
    console.error("Error during reg:", error.message);
    alert("Invalid credentials or server error");
  }
}
</script>
<template>
    <h1 class="AuthH1">Регистрация</h1>
    <div class="RegisterContainer">
        <div>
            <label for="login">Логин</label>
            <input v-model="username" type="text" id="login" name="login" required="" placeholder="Введите логин"></input>
            <label id="pasLb" for="password">Пароль</label>
            <input v-model="password" type="password" id="password" name="password" required="" placeholder="Введите пароль" minlength="6"></input>
            <button class="authBtn" @click="handleLogin">Зарегистрироватся</button>
        </div>
        <p>Уже есть аккаунт?<a href="/auth"> Войти</a></p>
    </div>
</template>