<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- el-card 卡片视图展示 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格  -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        :show-row-hover="false"
        border>
        <!--是否有效  -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen;"
          ></i>
          <i class="el-icon-error;" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level ===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level ===1">二级</el-tag>
          <el-tag type="danger" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operation" >
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类数据列表
      cateList: [],
      //查询参数
      queryInfo: {
        page: 3,
        pagenum: 1,
        pagesize: 5
      },
      //总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //是否列为模板
          type: "template",
          //模板名称
          template: "isOk"
        },
        {
          label: "排序",
          //是否列为模板
          type: "template",
          //模板名称
          template: "order"
        },
        {
          label: "操作",
          //是否列为模板
          type: "template",
          //模板名称
          template: "operation"
        }
      ]
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("请求商品分类失败!");
      }
      // 把数据列表，赋值给 catelist
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    //获取当前页码
    handleSizeChange(newPage){
      this.queryInfo.pagesize = newPage
      this.getCateList()
    },
    //获取当前页数
    handleCurrentChange(newSize){
      this.queryInfo.pagenum = newSize
      this.getCateList()
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 10px
}
</style>
