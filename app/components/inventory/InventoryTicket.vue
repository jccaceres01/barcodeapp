<template>
  <Page>
    <ActionBar class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <Label text="Boletas Inv." fontSize="20" android.position="actionBar" />
      <ActionItem @tap="filltickets"
        v-show="true"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_refresh"
        android.position="actionBar" />

      <ActionItem @tap="newTicket"
        v-show="true"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_add"
        android.position="actionBar" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="$store.state.loading" v-show="$store.state.loading" />
      <SearchBar hint="Buscar Boleta." v-model="searchPhrase" />
      <ListView for="item in filtered" @itemTap="ticketDetail" height="auto" v-if="hasTickets">
        <v-template>
          <GridLayout columns="auto, *, auto" rows="auto, auto">
            <Label class="accent-bg scc-yellow" verticalAlignment="center" col="0" row="0" :text="item.BOLETA" width="80" height="80" margin="3" />
            <StackLayout orientation="vertical" col="1" row="0">
              <Label textWrap="true">
                <FormattedString>
                  <Span text="Articulo: " style="font-size:20;" class="fa" />
                  <Span :text="item.ARTICULO" style="color:#8a8a8a; font-size:15" />
                  <Span text=" (" style="color:#8a8a8a; font-size:15" />
                  <Span :text="item.DESCRIPCION" style="color:#8a8a8a; font-size:15" />
                  <Span text=" )" style="color:#8a8a8a; font-size:15" />
                </FormattedString>
              </Label>
              <Label textWrap="true">
                <FormattedString>
                  <Span text="Bodega: " style="font-size:20;" class="fa" />
                  <Span :text="item.BODEGA" style="color:#8a8a8a; font-size:15" />
                </FormattedString>
              </Label>
              <Label textWrap="true">
                <FormattedString>
                  <Span text="Localizacion: " style="font-size:20;" class="fa" />
                  <Span :text="item.LOCALIZACION" style="color:#8a8a8a; font-size:15" />
                </FormattedString>
              </Label>
              <Label textWrap="true">
                <FormattedString>
                  <Span text="Cantidad: " style="font-size:20;" class="fa" />
                  <Span :text="item.CANT_DISP_RESERV" style="color:#8a8a8a; font-size:15" />
                </FormattedString>
              </Label>
            </StackLayout>
          </GridLayout>
        </v-template>
      </ListView>
      <!-- No tickets -->
      <Flexboxlayout flexDirection="column" justifyContent="center" alignItems="center"  flexWrap="false" v-else>
        <Label :text="'\uf46c'" class="fas" fontSize="30" />
        <Label text="No hay Boletas" textWrap="true" fontSize="30" style="color: gray; opacity: 0.30" />
      </Flexboxlayout>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import { mapActions } from 'vuex'
  import { Http } from '@nativescript/core'
  import TicketDetails from './dialogs/TicketDetails'
  import NewInventoryTicket from './NewInventoryTicket'

  export default {
    data() {
      return {
        icon: '\uf46c'
      }
    },
    computed: {
      filtered() {
        return this.tickets.filter(cb => {
          return (cb.BOLETA.toLowerCase().trim().indexOf(this.searchPhrase.trim().toLowerCase()) !== -1) ||
            (cb.ARTICULO.toLowerCase().trim().indexOf(this.searchPhrase.trim().toLowerCase()) !== -1) ||
            (cb.LOCALIZACION.toLowerCase().trim().indexOf(this.searchPhrase.trim().toLowerCase()) !== -1) ||
            (cb.DESCRIPCION.toLowerCase().trim().indexOf(this.searchPhrase.trim().toLowerCase()) !== -1)
        })
      },
      hasTickets() {
        return this.tickets.length > 0
      }
    },
    created() {
      this.filltickets()
    },
    data() {
      return {
        api: conf.api,
        ticketDet: TicketDetails,
        newInvTicket: NewInventoryTicket,
        searchPhrase: '',
        tickets: []
      }
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

      clearAll() {
        this.tickets = []
      },
      async filltickets() {

        this.loadOn()
        try {
          let res = await Http.getJSON(`${this.api}/inventory/ticket`)
          this.tickets = res
        } catch (error) { alert(error) }
        this.loadOff()
      },
      ticketDetail(event) {
        this.$navigateTo(this.ticketDet, {
          props: {
            ticket: event.item,
            parent: this
          }
        })
      },
      newTicket() {
        this.$navigateTo(this.newInvTicket, {
          props: {
            parent: this
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../app-variables';
  // End custom common variables

  // Custom styles

  .accent-bg {
    background: $accent-dark;
  }

  .scc-yellow {
    color: $scc-yellow;
  }

  .desc {
    font-size: 16;
    color: #747474;
  }

  .info {
      font-size: 20;
  }

  .mediumicon {
      font-size: 30;
  }
</style>
