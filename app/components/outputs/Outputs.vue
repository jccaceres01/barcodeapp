<template>
  <Page>
    <ActionBar class="action-bar" title="Salidas">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <ActionItem @tap="fillOutputs"
        ios.systemIcon="13" ios.position="right"
        android.systemIcon="ic_menu_refresh" />
      <ActionItem @tap="$navigateTo(newOut)"
        ios.systemIcon="4" ios.position="right"
        android.systemIcon="ic_menu_add" />
    </ActionBar>
    <GridLayout orientation="vertical">
      <ActivityIndicator :busy="busy" width="40" height="40"/>
      <ListView for="item in outputs" @itemTap="showViewOutput">
        <v-template>
          <GridLayout columns="auto, *, auto" rows="auto, auto">
            <Label backgroundColor="#3A53FF" verticalAlignment="center" col="0" row="0" :text="item.DOCUMENTO_INV" width="80" height="80" margin="3" color="#ffffff" />
            <StackLayout orientation="vertical" col="1" row="0">
              <Label textWrap="true">
                <FormattedString>
                  <Span text="Referencia: " style="font-size:20; color: #024dbe " />
                  <Span :text="item.REFERENCIA " style="color:#8a8a8a; font-size:15" />
                </FormattedString>
              </Label>
              <Label textWrap="true">
                <FormattedString>
                  <Span text="Fecha: " style="font-size:20; color:#024dbe " />
                  <Span :text="item.FECHA_HOR_CREACION" style="color:#8a8a8a; font-size:15" />
                </FormattedString>
              </Label>
            </StackLayout>
          </GridLayout>
        </v-template>
      </ListView>
    </GridLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import axios from 'axios'

  import NewOutput from './NewOutput'
  import ViewOutput from './ViewOutput'

  export default {
    data() {
      return {
        api: conf.api,
        busy: false,
        newOut: NewOutput,
        viewOutput: ViewOutput,
        outputs: []
      }
    },
    created() {
      this.fillOutputs()
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      clearAll() {
        this.outputs = []
        this.fillOutputs()
      },
      fillOutputs() {
        this.outputs = []
        this.loadOn()
        axios.get(this.api+'outputs').then(res => {
          this.outputs = res.data
          this.loadOff()
        }).catch(er => {
          alert(er)
            .then(() => {
              this.clearAll()
            });
        })
      },
      showViewOutput(event) {
        this.$navigateTo(this.viewOutput, {props: {output: event.item}})
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
</style>
