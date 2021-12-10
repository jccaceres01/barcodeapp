<template>
  <Page>
    <StackLayout>
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Label text="Localizaciones" fontSize="30" class="accent-bg scc-yellow" />
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
  import config from '../../../customconfig.json'
  import { mapActions } from 'vuex'
  import { Http } from '@nativescript/core'

  export default {
    data() {
      return {
        criteria: '',
        api: config.api,
        locations: []
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
    created() {
      if (this.storage) {
        this.fillLocations()
      } else {
        this.locations.push({
          BODEGA: '000',
          LOCALIZACION: '000',
          DESCRIPCION: 'Sin Bodega Seleccionada',
          VOLUMEN: 0,
          PESO_MAX: 0
        })
      }
    },
    props: ['storage'],
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

      returnValue(event) {
        this.$modal.close(event.item)
      },
      async fillLocations() {
        if (this.storage) {
          this.loadOn()
          try {
            let res = await Http.getJSON(`${this.api}/localizacion/${this.storage}`)
            this.locations = res
          } catch (error) { alert(error)}
          this.loadOff()
        } else {
          alert('Debe seleccionar una bodega').then(() => {
            this.$modal.close()
          })
        }
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
