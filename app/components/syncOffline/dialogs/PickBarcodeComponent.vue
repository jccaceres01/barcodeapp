<template>
  <Page>
    <ActionBar title="" class="action-bar" />

    <StackLayout orientation="vertical" style="padding: 10">
      <ActivityIndicator :busy="busy" v-show="busy" />
      <Label text="Leer Código De Barras" horizontalAlignment="center" />
      <Label horizontalAlignment="center">
        <Span class="fas bigicon" text.decode="&#xf02a;" horizontalAlignment="center "/>
      </Label>
      <TextField v-model="input" hint="Código de Barras" @returnPress="returnBarcode" keyboardType="text" horizontalAlignment="center"/>
    </StackLayout>
  </Page>
</template>

<script>
  export default {
    data() {
      return {
        busy: false,
        input: ''
      }
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      returnBarcode() {
        this.$modal.close(this.input)
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../../app-variables';
  // End custom common variables

  // Custom styles
  .fas {
      color: $accent-dark;
  }

  .desc {
    font-size: 16;
    color: #747474;
  }

  .info {
      font-size: 20;
  }

  .bigicon {
    font-size: 200;
  }
</style>
