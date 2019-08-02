<template>
    <Page class="page">
        <ActionBar class="action-bar">
            <Label class="action-bar-title" :text="appName"></Label>
            <ActionItem @tap="$navigateTo(configView)"
              ios.systemIcon="2" ios.position="right"
              text="Configuración"
              android.position="popup" />
        </ActionBar>

        <StackLayout orientation="horizontal">
          <ListView class="list-group" for="item in listItems"
            @itemTap="pickMenu" style="height:1250px">
            <v-template>
              <FlexboxLayout flexDirection="row" class="list-group-item">
                <Label fontSize="20" style="width: 20%">
                  <Span class="fas mediumicon" :text="item.icon" :class="{'offline': !item.online}" />
                </Label>
                <Label :text="item.name" class=" fas list-group-item-heading"
                    style="width: 80%" />
              </FlexboxLayout>
            </v-template>
          </ListView>
        </StackLayout>
    </Page>
</template>

<script>
  import conf from '../customconfig.json'
  import Barcode from './barcode/Barcode'
  import Outputs from './outputs/Outputs'
  import Search from './search/Search'
  import InventoryTicket from './inventory/InventoryTicket'
  import ConfigView from './ConfigView'
  import SyncHomeComponent from './syncOffline/SyncHomeComponent'
  import SyncItemsComponent from './syncOffline/SyncItemsComponent'

  export default {
    computed: {
    },
    data() {
      return {
        appName: conf.appname,
        barcode: Barcode,
        outputs: Outputs,
        configView: ConfigView,
        search: Search,
        inventory: InventoryTicket,
        sync: SyncHomeComponent,
        syncItems: SyncItemsComponent,
        listItems: [
          {id: 'codbarras', name: 'Escanear Códigos', icon: '\uf02a', online: true },
          {id: 'codbarrasoff', name: 'Escanear Códigos Sin Conexión', icon: '\uf02a', online: false },
          {id: 'salidas', name: 'Salidas', icon: '\uf482', online: true },
          {id: 'salidasoff', name: 'Salidas Sin Conexión', icon: '\uf482', online: false },
          {id: 'consultar', name: 'Consultar Repuestos', icon: '\uf002', online: true },
          {id: 'consultaroff', name: 'Consultar Repuestos Sin Conexión', icon: '\uf002', online: false },
          {id: 'boletainv', name: 'Boletas de Inventario', icon: '\uf46c', online: true },
          {id: 'boletainvoff', name: 'Boletas de Inventario Sin Conexión', icon: '\uf46c', online: false },
          {id: 'sync', name: 'Sincronización Sin Conexión', icon: '\uf2f1', online: true }
        ]
      }
    },
    methods: {
      pickMenu(event) {
        switch (event.item.id) {
          case 'codbarras':
            this.$navigateTo(this.barcode)
            break;
          case 'salidas':
            this.$navigateTo(this.outputs)
            break;
          case 'consultar':
            this.$navigateTo(this.search)
            break;
          case 'boletainv':
            this.$navigateTo(this.inventory)
            break;
          case 'sync':
            this.$navigateTo(this.sync)
            break;
          case 'codbarrasoff':
            this.$navigateTo(this.syncItems)
            break;
          default:
        }
      }
    }
  };
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import '../app-variables';
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

    .bigicon {
      font-size: 100;
    }

    .mediumicon {
      font-size: 30;
    }

    .offline {
      color: lightgray;
    }
</style>
