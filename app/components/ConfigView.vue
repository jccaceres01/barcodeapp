<template>
  <Page class="page">
    <ActionBar title="Configuración" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout>
        <Label text="App Name: " style="font-size:20; color:#000000" />
        <Label :text="appName" style="font-size:15; color:#5c5c5c" />
        <Label text="Api Url: " style="font-size:20; color:#000000" />
        <Label :text="api" style="font-size:15; color:#5c5c5c" />
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../customconfig.json'

  export default {
    data() {
      return {
        appName: conf.appname,
        api: conf.api
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../app-variables';
  // End custom common variables

  // Custom styles
  .fa {
      color: $accent-dark;
  }

  .info {
      font-size: 20;
  }

  .bigicon {
    font-size: 100;
  }
</style>
