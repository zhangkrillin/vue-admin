<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- el-card 卡片 -->
    <el-card>
      <!-- 警告提示 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类 -->
      <el-row>
        <el-col>
          选择商品分类:
          <el-cascader
            v-model="selectedOptions"
            :options="cartInfo"
            :props="optionProps"
            @change="handleChange"
          ></el-cascader>
          <!-- tabs 标签页 -->
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="动态参数" name="many">
              <el-button type="primary" :disabled="isShow">动态参数</el-button>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
              <el-button type="primary" :disabled="isShow">静态属性</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cartInfo: [],
      selectedOptions: [],
      optionProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      activeName: "many"
    };
  },
  created() {
    this.getCartInfo();
  },
  methods: {
    async getCartInfo() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败!");
      }
      this.cartInfo = res.data[0].children;
    },
    //数据状态发生改变
    handleChange() {
      this.getParamsInfo();
    },
    // 切换动态或静态属性触发
    handleClick() {
      this.getParamsInfo();
    },
    // 请求动态或者静态参数数据列表
    async getParamsInfo() {
      if (this.selectedOptions.length !== 2) {
        this.selectedOptions = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.getId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("请求参数列表失败!");
      }
      console.log(res);
    }
  },
  //是否显示
  computed: {
    isShow() {
      if (this.selectedOptions.length === 2) {
        return false;
      } else {
        return true;
      }
    },
    //获取级联第二级id
    getId() {
      if (this.selectedOptions.length === 2) {
        return this.selectedOptions[1];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  margin: 15px 0 15px;
}
</style>
