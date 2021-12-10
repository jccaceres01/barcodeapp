<template>
  <Page>
    <StackLayout>
      <Label :text="'Localizaciones ('+ this.warehouse +')' " fontSize="30" class="accent-bg scc-yellow" />
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <TextField v-model="criteria" hint="Filtrar" keyboardType="text "/>
      <ListView for="item in filtered" @itemTap="returnValue" width="*" height="100%">
        <v-template>
          <Label :text="item.LOCALIZACION" fontSize="35" />
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
    created() {
      this.fillLocations()
    },
    data() {
      return {
        api: conf.api,
        criteria: '',
        locations: [],
      }
    },
    computed: {
      filtered() {
        return this.locations.filter(cb => {
          return (cb.LOCALIZACION.trim().toLowerCase()
            .indexOf(this.criteria.toLowerCase()) !== -1)
        })
      }
    },
    props: {
      warehouse: {require: true, type: String, default: null}
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

      async fillLocations() {
        this.loadOn()
        try {
          let res = await Http.getJSON(`${this.api}/localizacion/${this.warehouse}`)
          this.locations = res
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
