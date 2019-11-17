<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- el-card 卡片 -->
    <el-card>
      <!-- 搜索与添加商品 -->
      <el-row :gutter="20">
        <!-- 搜索与添加 -->
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="paramsInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加信息 -->
        <el-col :span="4">
          <el-button type="primary" @click="goGoodsList">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 渲染el-table 表格 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="110px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="upd_time" label="创建时间" width="180px">
          <template slot-scope="scope">{{scope.row.upd_time | formatDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGoodsList(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- pagination 完整分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="paramsInfo.pagenum"
        :page-sizes="[5, 10, 25, 30]"
        :page-size="paramsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      goodsList: [],
      paramsInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.paramsInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败!");
      }
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newsize) {
      this.paramsInfo.pagesize = newsize;
      this.getGoodsList();
    },
    handleCurrentChange(newpage) {
      this.paramsInfo.pagenum = newpage;
      this.getGoodsList();
    },
    //删除数据列表
    async deleteGoodsList(id) {
      const result = await this.$confirm(
        "此操作将永久删除该商品列表, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (result !== "confirm") {
        return this.$message.info("已取消删除该商品列表!");
      }
      const { data: res } = await this.$http.delete(`goods/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除该商品列表失败!");
      }
      this.$message.success("已成功删除该商品列表");
      this.getGoodsList();
    },
    goGoodsList() {
      this.$router.push("/goods/add");
    }
  }
};
</script>

<style lang="less" scoped>
</style>
