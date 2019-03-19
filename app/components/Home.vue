<template>
    <Page class="page">
        <ActionBar class="action-bar">
            <Label class="action-bar-title" :text="appName"></Label>
            <ActionItem @tap="$navigateTo(configView)"
              ios.systemIcon="2" ios.position="right"
              text="Configuración"
              android.position="popup" />
        </ActionBar>

        <GridLayout columns="150, 150" rows="150, 150">
          <Button @tap="$navigateTo(barcode)" row="0" col="0">
            <Span class="fa bigicon" text.decode="&#xf02a; "/>
            <Span text="Cod. Barras" class="info" />
          </Button>
          <Button @tap="$navigateTo(outputs)" row="0" col="1" >
            <Span class="fa bigicon" text.decode="&#xf16b; "/>
            <Span text="Salidas" class="info" />
          </Button>
        </GridLayout>
    </Page>
</template>

<script>
  import conf from '../customconfig.json'
  import Barcode from './barcode/Barcode'
  import Outputs from './outputs/Outputs'
  import ConfigView from './ConfigView'

  export default {
    computed: {
    },
    data() {
      return {
        appName: conf.appname,
        barcode: Barcode,
        outputs: Outputs,
        configView: ConfigView
      }
    },
    methods: {
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

    .info {
        font-size: 20;
    }

    .bigicon {
      font-size: 100;
    }
</style>
