<template>
  <Page class="page">
    <ActionBar class="action-bar" title="Consultar Repuestos">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <SearchBar hint="Usar Código, Número de parte" v-model="criteria"  @submit="searchItems" />
      <!-- <Button text="Limpiar Resultados" @tap="clear()" v-show="hasItems" /> -->
      <ListView for="item in items" height="100%">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" class="p-b-10">
                  <FormattedString>
                    <Span :text="item.ARTICULO" style="color: #1b1b1b" fontSize="25" />
                    <Span text="(" fontSize="18" />
                    <Span :text="item.DESCRIPCION" fontSize="18" />
                    <Span text=")" fontSize="18" />
                  </FormattedString>
                </Label>
                <FlexboxLayout flexDirection="row">
                  <StackLayout orientation="verticla" width="50%">
                    <Label text="Bodega: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.BODEGA" textWrap="true" fontSize="10" />
                    <Label text="Cant. Disponible: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.CANT_DISPONIBLE" textWrap="true" fontSize="10" />
                    <Label text="Original: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label v-if="(item.CLASIFICACION_2 == '02-01')">
                      <FormattedString>
                        <Span class="fas" text.decode="&#xf058;"/>
                      </FormattedString>
                    </Label>
                    <Label v-else>
                      <FormattedString>
                        <Span class="fas" text.decode="&#xf057;"/>
                      </FormattedString>
                    </Label>
                  </StackLayout>
                  <StackLayout orientation="verticla" width="50%">
                    <Label text="Localización: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.LOCALIZACION" textWrap="true" fontSize="10" />
                    <Label text="Cant. Reservada: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.CANT_RESERVADA" textWrap="true" fontSize="10" />
                  </StackLayout>
                </FlexboxLayout>
              </StackLayout>
            </FlexboxLayout>
          </StackLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import { Http } from '@nativescript/core'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        api: conf.api,
        busy: false,
        criteria: '',
        items: []
      }
    },
    methods: {
      ...mapActions(['test', 'loadOn', 'loadOff']),
      clear() {
        this.items = []
        this.criteria = ''
        this.loadOff()
      },
      async searchItems() {
        this.loadOn()
        try {
          // Get data
          let res = await Http.getJSON(`${this.api}/search/articuloscodigo?criteria=${this.criteria}`)
          this.items = res
        } catch (er) {
          alert(er)
        }
        this.loadOff()
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
