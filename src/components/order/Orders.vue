<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- el-card 卡片区-->
    <el-card>
      <!-- 搜索查询框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @close="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- el-table展示表格 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" width="120px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status=== '0'">未付款</el-tag>
            <el-tag type="success" v-else>付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="100px"></el-table-column>
        <el-table-column label="下单时间" width="200px">
          <template slot-scope="scope">{{scope.row.create_time | formatDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template>
            <el-tooltip class="item" effect="light" content="修改订单地址" placement="top-start">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialogVisible"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="light" content="物流信息" placement="right-end">
              <el-button
                type="success"
                icon="el-icon-location"
                size="mini"
                @click="showProcessDialog"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- 完整分页 -->
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5 ,10, 15, 20]"
        :page-size="queryInfo.pagensize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改地址dialog对话框 -->
    <el-dialog title="修改地址" :visible.sync="dialogVisible" width="50%" @close="addressDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <!-- 省市区/县 -->
        <el-form-item label="省市区/县" prop="address1">
          <!-- <el-cascader v-model="addForm.address1" :options="cityData" ></el-cascader> -->
          <el-cascader-multi
            v-model="addForm.address1"
            :data="cityData"
            expand-trigger="hover"
            @change="handleChange"
            only-last
            clearable
            separator="/"
          ></el-cascader-multi>
        </el-form-item>
        <!-- 详细地址 -->
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息dialog对话框 -->
    <el-dialog title="查看物流进度" :visible.sync="processDialogVisible" width="50%">
      <el-timeline >
        <el-timeline-item
          v-for="(activity, index) in processList"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./cityData.js";
export default {
  data() {
    return {
      ordersList: [],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      dialogVisible: false,
      addForm: {
        address1: [],
        address2: ""
      },
      addFormRules: {
        address1: [{ required: true, message: "请输入地址", trigger: "blur" }],
        address2: [
          { required: true, message: "请填写详细的物流地址", trigger: "blur" }
        ]
      },
      cityData,
      processDialogVisible: false,
      processList: []
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败!");
      }
      this.ordersList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getOrderList();
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getOrderList();
    },
    showDialogVisible() {
      this.dialogVisible = true;
    },
    handleChange() {
      console.log(this.addForm.address1);
    },
    addressDialogClose() {
      this.$refs.addFormRef.resetFields();
      this.dialogVisible = false;
    },
    //查看物流
    async showProcessDialog() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");

      console.log(res.data);
      this.processList = res.data;
      this.processDialogVisible = true;
    }
  }
};
</script>

<style lang="less" scoped>
</style>
