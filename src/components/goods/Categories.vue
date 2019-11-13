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
          <el-button type="primary" @click="showAddCart">添加分类</el-button>
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
        border
      >
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
        <template slot="operation">
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
    <!-- dialog添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCartDialogVisible"
      width="50%"
      @close="addCartDialogClose"
    >
      <!-- 分类列表 -->
      <el-form
        :model="addCartForm"
        :rules="addCartFormRules"
        ref="addCartFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCartForm.cat_name"></el-input>
        </el-form-item>
        <!-- 父级分类 -->
        <el-form-item label="父级分类:">
          <!-- 级联选择器 -->
          <!-- pros 渲染的级联数据 -->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCartDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCart">确 定</el-button>
      </span>
    </el-dialog>
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
      ],
      //添加分类对话框关闭和显示
      addCartDialogVisible: false,
      addCartForm: {
        //分类名称
        cat_name: "",
        //分类父 ID
        cat_pid: 0,
        //分类层级 0表示一级分类；1表示二级分类；2表示三级分类
        cat_level: 0
      },
      //校验规则
      addCartFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //获取父级分类列表
      parentCateList: [],
      //选择的分类组件的ID
      selectedKeys: [],
      //渲染数据的制定选项
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        // checkStrictly: true,
        expandTrigger: "hover",
        checkStrictly: true
      }
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
    handleSizeChange(newPage) {
      this.queryInfo.pagesize = newPage;
      this.getCateList();
    },
    //获取当前页数
    handleCurrentChange(newSize) {
      this.queryInfo.pagenum = newSize;
      this.getCateList();
    },
    //打开添加分类显示对话框
    showAddCart() {
      this.getParentCartList();
      this.addCartDialogVisible = true;
    },
    //获取商品前两层分类
    async getParentCartList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！");
      }
      this.parentCateList = res.data;
    },
    //选择项发生改变时触发的函数
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        this.addCartForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCartForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCartForm.cat_pid = 0;
        this.addCartForm.cat_level = 0;
      }
    },
    //对话框关闭时
    addCart() {
      this.$refs.addCartFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCartForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败!");
        }
        this.$message.success("添加分类成功!");
        this.getCateList();
        this.addCartDialogVisible = false;
      });
    },
    //关闭对话框
    addCartDialogClose() {
      this.$refs.addCartFormRef.resetFields();
      this.addCartForm.cat_pid = 0;
      this.addCartForm.cat_level = 0;
      this.selectedKeys = [];
      this.addCartDialogVisible = false;
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>
