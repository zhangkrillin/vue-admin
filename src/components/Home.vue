<template>
  <div>
     <el-button type="info" @click="goback">退出</el-button>
  </div>
</template>

<script>
export default {
    methods: {
        //退出 清空token
        goback(){
            window.sessionStorage.clear()
            this.$router.push('/login')
        }
    },
};
</script>

<style lang="less" scoped>

</style>
