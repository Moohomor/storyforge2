<template>
    <h1 class="AuthH1">Регистрация</h1>
    <div class="RegisterContainer">
        <form method="POST" action="/auth/reg">
            <label for="login">Логин</label>
            <input type="text" id="login" name="login" required="" placeholder="Введите логин"></input>
            <label id="pasLb" for="password">Пароль</label>
            <input type="password" id="password" name="password" required="" placeholder="Введите пароль" minlength="6"></input>
            <label id="pasLb" for="passwordCheck">Пароль</label>
            <input type="password" id="passwordCheck" name="passwordCheck" required="" placeholder="Повторите пароль" minlength="6"></input>
            <button type="submit" class="authBtn">Зарегистрироватся</button>
        </form>
        <p>Уже есть аккаунт?<a href="/auth"> Войти</a></p>
    </div>
</template>