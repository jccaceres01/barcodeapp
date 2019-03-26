<template>
  <Page class="page">
    <ActionBar class="action-bar" title="Consulta">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="busy" @busyChange="" />
      <SearchBar hint="Usar Código, Número de parte" v-model="criteria" @textChange="" @submit="searchItems" v-show="!hasItems" />
      <Button text="Limpiar Resultados" @tap="clear()" v-show="hasItems" />
      <ScrollView orientation="verticval" width="fillContainer%" height="90%">
        <ListView for="item in items" @itemTap="viewStock" v-show="hasItems" height="99%" width="99%">
          <v-template>
            <StackLayout orientation="vertical">
              <Label height="20" width="*">
                <Span text="Descripción: " class="fa" />
                <Span :text="item.DESCRIPCION" class="desc" />
              </Label>
              <Label height="20" width="*">
                <Span text="Cod. Softland: " class="fa" />
                <Span :text="item.ARTICULO" class="desc" />
              </Label>
              <Label v-if="(item.CLASIFICACION_2 == '02-01')" height="20" width="*">
                <Span text="Original: " style="styles" class="fa" />
                <Span class="fa" text.decode="&#xf058; "/>
              </Label>
              <Label v-else height="20" width="*">
                <Span text="After Market: " style="styles"  class="fa" />
                <Span class="fa" text.decode="&#xf057; "/>
              </Label>
            </StackLayout>
          </v-template>
        </ListView>
      </ScrollView>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import StockDetail from './StockDetail'
  import axios from 'axios'

  export default {
    data() {
      return {
        api: conf.api,
        busy: false,
        stockDetail: StockDetail,
        criteria: '',
        items: []
      }
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      clear() {
        this.items = []
        this.criteria = ''
        this.loadOff()
      },
      viewStock(event) {
        this.$showModal(this.stockDetail, { props: {item: event.item}})
      },
      searchItems() {
        this.loadOn()
        axios.get(this.api+'search/articuloscodigo', {
          params: {
            criteria: this.criteria
          }
        }).then(res => {
          if (res.data.length > 0) {
            this.items = res.data
          } else {
            alert('No se encontraron respuestos')
          }
          this.loadOff()
        }).catch(er => {
          alert(er)
          this.clear()
        })
      }
    },
    computed: {
      hasItems() {
        return (this.items.length > 0)
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../app-variables';
  // End custom common variables

  // Custom styles
  .fa {
      color: $accent-dark;
  }

  .info {
      font-size: 20;
  }

  .t-uppercase {
    text-transform: uppercase;
  }
</style>
