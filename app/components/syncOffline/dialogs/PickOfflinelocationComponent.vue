<template>
  <Page>
    <ActionBar class="action-bar" title="Seleccionar Bodega" />

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <Label :text="status" fontSize="18" textWrap="true" verticalAlignment="center" horizontalAlignment="center" class="p-5" />
      <!-- Filter box -->
      <SearchBar hint="Filtrar Localizaciones" v-model="criteria" @textChange="" @submit="" />
      <!-- List  of items -->
      <ListView for="(item, index) in filtered" @itemTap="pickThis" height="100%">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <!-- Black Bar -->
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" class="p-b-10">
                  <FormattedString>
                    <Span text="Localización: " style="color: #1b1b1b" fontSize="25" />
                    <Span :text="item.localizacion" style="color: #1b1b1b" fontSize="25" />
                  </FormattedString>
                </Label>
                <Label textWrap="true" class="p-5">
                  <FormattedString>
                    <Span text="Descripción: " style="color: #424242" fontSize="20" />
                    <Span :text="item.descripcion" style="color: #424242" fontSize="20" />
                  </FormattedString>
                </Label>
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

  export default {
    data() {
      return {
        busy: false,
        status: 'Seleccionar Localización',
        criteria: '',
        localizaciones: []
      }
    },
    props: ['bodega'],
    created() {
      this.fillLocations()
    },
    computed: {
      filtered() {
        return this.localizaciones.filter(cb => {
          return (cb.localizacion.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1) ||
            (cb.descripcion.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1)
        })
      }
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      pickThis(event) {
        this.$modal.close(event.item.localizacion)
      },
      fillLocations() {
        if (Sqlite.exists('local')) {
          this.loadOn()
          var promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })

          promise.then(db => {
            db.resultType(Sqlite.RESULTSASOBJECT)
            db.all('select * from localizaciones where bodega = ? order by localizacion', [this.bodega], (er, res) => {
              if (!er) {
                if (res.length > 0) {
                  this.localizaciones = res
                } else {
                  this.status = 'No se encontraron localizaciones'
                }
              } else { alert(er) }
            })

            // Close connection
            db.close();
          })

          this.loadOff()
        } else { alert('No existe la base de datos local') }
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
</style>
