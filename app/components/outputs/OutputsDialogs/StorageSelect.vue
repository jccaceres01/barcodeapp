<template>
  <Page>
    <StackLayout>
      <ActivityIndicator :busy="busy" @busyChange="" />
      <Label text="Bodegas" fontSize="30" />
      <ListView for="item in storages" @itemTap="returnValue" width="*" height="100%">
        <v-template>
          <Label :text="item.NOMBRE" fonSize="20" />
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  import axios from 'axios'
  import conf from '../../../customconfig.json'

  export default {
    data() {
      return {
        // config
        api: conf.api,
        // data
        busy: false,
        storages: []
      }
    },
    created() {
      this.fillStorages()
    },
    methods: {
      loadOn() { this.busy = true},
      loadOff() {this.busy = false},
      fillStorages() {
        this.loadOn()
        axios.get(this.api+'bodega').then(res => {
          this.storages = res.data
          this.loadOff()
        }).catch(er => {
          alert(er)
          this.$modal.close()
        })
      },
      returnValue(event) {
        this.$modal.close(event.item)
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
