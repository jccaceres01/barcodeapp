<template>
  <Page>
    <ActionBar title="Consultas Fuera de Linea" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Label verticalAlignment="center" horizontalAlignment="center" fontSize="20" class="p-t-10" v-if="$store.state.loading">
        <FormattedString>
          <Span class="fas" text.decode="&#xf12a;"/>
          <Span text=" " fontSize="20" />
          <Span :text="status" fontSize="20" />
        </FormattedString>
      </Label>
      <SearchBar hint="Buscar Repuestos" v-model="criteria" @submit="findItem" />
      <ListView for="item in results" height="100%">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <!-- Black Bar -->
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" class="p-b-10">
                  <FormattedString>
                    <Span :text="item.articulo" style="color: #1b1b1b" fontSize="25" />
                    <Span text="(" fontSize="18" />
                    <Span :text="item.descripcion" fontSize="18" />
                    <Span text=")" fontSize="18" />
                  </FormattedString>
                </Label>
                <FlexboxLayout flexDirection="row">
                  <StackLayout orientation="verticla" width="50%">
                    <Label text="Bodega: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.bodega" textWrap="true" fontSize="10" />
                    <Label text="Cant. Disponible: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.cant_disponible" textWrap="true" fontSize="10" />
                    <Label text="Original: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label v-if="(item.clasificacion_2 == '02-01')">
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
                    <Label :text="item.localizacion" textWrap="true" fontSize="10" />
                    <Label text="Cant. Reservada: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.cant_reservada" textWrap="true" fontSize="10" />
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
  import Sqlite from 'nativescript-sqlite'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        status: '',
        criteria: '',
        results: []
      }
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),
      
      findItem() {
        if (Sqlite.exists('local')) {

          var promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })

          this.loadOn()
          this.status = 'Consultando repuesto'

          promise.then(db => {
            db.resultType(Sqlite.RESULTSASOBJECT)

            db.all('select * from existencia_lote where articulo like ? or descripcion like ?', ['%'+this.criteria+'%', '%'+this.criteria+'%'], (er, res) => {
              if (!er) {
                this.results = res
              } else { alert(er) }
            })
          })

          this.status = ''
          this.loadOff()
        } else { alert('No existe la base de datos local') }
      }
    }
  }

</script>

<style lang="scss" scoped >
  // Start custom common variables
  @import '../../app-variables';
  // End custom common variables

  // Custom styles
  .fa {
    color: $accent-dark;
  }

  .fas {
    color: $accent-dark;
  }

  .info {
    font-size: 20;
  }

  .mediumicon {
    font-size: 30;
  }

  .bigicon {
    font-size: 100;
  }

</style>
