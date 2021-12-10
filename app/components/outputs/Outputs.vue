<template>
  <Page>
    <ActionBar class="action-bar" title="Salidas">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <ActionItem @tap="fillOutputs"
        ios.systemIcon="13" ios.position="right"
        android.systemIcon="ic_menu_refresh" />
      <ActionItem @tap="createNewOutput"
        ios.systemIcon="4" ios.position="right"
        android.systemIcon="ic_menu_add" />
    </ActionBar>
    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="$store.state.loading" v-show="$store.state.loading" />
      <SearchBar hint="Buscar Salidas" v-model="criteria" v-show="(outputs.length > 0)" />
      <Label text="No hay Salidas" v-show="!(outputs.length > 0)" fontSize="20" textWrap="true" verticalAlignment="center" horizontalAlignment="center" marginTop="10" />
      <ListView for="(item, index) in filtered" @itemTap="showViewOutput" height="100%">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <!-- Black Bar -->
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" paddingBottom="2" verticalAlignment="center" horizontalAlignment="center" style="boder-bottom-style:solid; border-bottom-color: #262626; border-bottom-width:4px">
                  <FormattedString>
                    <Span text="Salida No.: " style="color: #404040" fontSize="24"/>
                    <Span :text="item.DOCUMENTO_INV" style="color: #7e7e7e" fontSize="22" />
                  </FormattedString>
                </Label>
                <FlexboxLayout flexDirection="row">
                  <StackLayout orientation="vertical" width="50%">
                    <Label text="Referencia: " style="color: #404040" fontSize="16" fontWeight="bold" />
                    <Label :text="item.REFERENCIA" style="color: #7e7e7e" fontSize="14" textWrap="true" />
                  </StackLayout>
                  <StackLayout orientation="vertical" width="50%">
                    <Label text="Fecha: " style="color: #404040" fontSize="16" fontWeight="bold"/>
                    <Label :text="item.FECHA_HOR_CREACION" style="color: #7e7e7e" fontSize="14" textWrap="true" />
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
  import NewOutput from './NewOutput'
  import ViewOutput from './ViewOutput'

  export default {
    data() {
      return {
        api: conf.api,
        busy: false,
        newOut: NewOutput,
        viewOutput: ViewOutput,
        criteria: '',
        outputs: []
      }
    },
    computed: {
      filtered() {
        return this.outputs.filter(filterCb => {
          return (filterCb.DOCUMENTO_INV.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1) ||
            (filterCb.REFERENCIA.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1)
        })
      }
    },
    created() {
      this.fillOutputs()
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),
      clearAll() {
        this.outputs = []
        this.fillOutputs()
      },
      async fillOutputs() {
        this.outputs = []

        this.loadOn()
        try { 
          let res = await Http.getJSON(`${this.api}/outputs`)
          this.outputs = res
        } catch (er) { alert(er) }
        this.loadOff()
      },
      showViewOutput(event) {
        this.$navigateTo(this.viewOutput, {props: {output: event.item}})
      },
      createNewOutput() {
        this.$navigateTo(this.newOut, { props: { parent: this } })
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
