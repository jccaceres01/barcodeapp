<template>
  <Page actionBarHidden="false" statusBarStyle="dark">
    <StackLayout orientation="horizontal">
      <Label :text="label" textWrap="true" />
      <Button text="Greetings" @tap="greetings" />
    </StackLayout>
  </Page>
</template>

<script>
import { alert } from '@nativescript/core'
export default {
  data() {
    return {
      label: "Hellow World"
    }
  },
  methods: {
    greetings() {
      alert('Hello World!')
    }
  }
}
</script>

<style>

</style>