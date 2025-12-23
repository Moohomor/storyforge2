<template>
    <h1 class="AuthH1">Вход</h1>
    <div class="AuthContainer">
        <form method="POST" action="/auth/login">
            <label for="login">Логин</label>
            <input type="text" id="login" name="login" required="" placeholder="Введите логин"></input>
            <label id="pasLb" for="password">Пароль</label>
            <input type="password" id="password" name="password" required="" placeholder="Введите пароль" minlength="6"></input>
            <button type="submit" class="authBtn">Войти</button>
        </form>
        <p>Еще нет аккаунта? <a href="/register">Создать аккаунт</a></p>
    </div>
</template>