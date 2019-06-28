<template>
  <Page>
    <StackLayout>
      <Label text="Localizaciones" fontSize="30" />
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <TextField v-model="criteria" hint="Filtrar" @returnPress="" keyboardType="text "/>
      <ListView for="item in filtered" @itemTap="returnValue" width="*" height="100%">
        <v-template>
          <Label :text="item.LOCALIZACION" fontSize="20" />
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../../customconfig.json'
  import axios from 'axios'

  export default {
    data() {
      return {
        apiUrl: conf.api,
        busy: false,
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
    created() {
      this.fillLocations()
    },
    props: ['warehouse'],
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false},
      fillLocations() {
        this.loadOn()
        axios.get(this.apiUrl+'localizacion/'+this.warehouse).then( res => {
          this.locations = res.data
          this.loadOff()
        }).catch( er => {
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
