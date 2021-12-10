<template>
  <Page>
    <StackLayout>
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Label text="Bodegas" fontSize="30" class="accent-bg scc-yellow" />
      <ListView for="item in storages" @itemTap="returnValue" width="*" height="100%">
        <v-template>
          <Label :text="'('+item.BODEGA+') '+item.NOMBRE" fontSize="35" />
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../../customconfig.json'
  import { Http } from '@nativescript/core'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        // config
        api: conf.api,
        // data
        storages: []
      }
    },
    created() {
      this.fillStorages()
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

      async fillStorages() {
        this.loadOn()
        try {
          let res = await Http.getJSON(`${this.api}/bodega`)
          this.storages = res
        } catch (error) {
          alert(error)
          this.$modal.close()
        }
        this.loadOff()
      },
      returnValue(event) {
        this.$modal.close(event.item)
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../../app-variables';
  // End custom common variables

  // Custom styles
  .fa {
      color: $accent-dark;
  }

  .accent-bg {
    background: $accent-dark;
  }

  .scc-yellow {
    color: $scc-yellow;
  }

  .info {
      font-size: 20;
  }
</style>
