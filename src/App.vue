<template>
  <div class="app">
    <header class="app-header">
      <h1>ARC - Abstract Reasoning Challenge</h1>
    </header>
    <main>
      <router-view/>
    </main>
    <footer class="app-footer">
      <p>Modern ARC Interface</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  height: 100%;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  color: #2c3e50;
}

.app-header {
  background-color: #3a7bd5;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0;
    font-weight: 500;
  }
}

main {
  flex: 1;
  padding: 1rem;
}

.app-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.9rem;
}
</style> 