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
              <el-button type="primary" :disabled="isShow" @click="dialogClick">动态参数</el-button>
              <!-- 动态参数表格 -->
              <el-table :data="activeInfo" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      v-for="(item,tag) in scope.row.attr_vals"
                      :key="item.attr_id"
                      closable
                      @close="handleClose(scope.row,tag)"
                    >{{item}}</el-tag>
                    <!-- 添加attr_vals -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    ></el-input>
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      @click="showEditDialog(scope.row.attr_id)"
                    >修改</el-button>
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="deleteAttr(scope.row.attr_id)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 静态属性 -->
            <el-tab-pane label="静态属性" name="only">
              <el-button type="primary" :disabled="isShow" @click="dialogClick">静态属性</el-button>
              <!-- 静态属性数据表格 -->
              <el-table :data="staticInfo" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      v-for="(item,tag) in scope.row.attr_vals"
                      :key="item.attr_id"
                      closable
                      @close="handleClose(scope.row,tag)"
                    >{{item}}</el-tag>
                    <!-- 添加attr_vals -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    ></el-input>
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      @click="showEditDialog(scope.row.attr_id)"
                      size="mini"
                    >修改</el-button>
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="deleteAttr(scope.row.attr_id)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <!-- dailog 对话框(添加动态或静态参数) -->
      <el-dialog
        :title="'添加'+titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDilalogClose"
      >
        <!-- 添加动态或者静态参数 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addDialogAttr">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!-- 修改动态或静态属性 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDilalogClose"
    >
      <!-- 添加动态或者静态参数 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogAttr">确 定</el-button>
      </span>
    </el-dialog>
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
      activeName: "many",
      //获取动态数据
      activeInfo: [],
      //获取静态数据
      staticInfo: [],
      // 关闭或开启对话框
      addDialogVisible: false,
      addForm: {
        attr_name: ""
      },
      addFormRules: {
        attr_name: [
          { required: true, message: "请添加参数名称", trigger: "blur" }
        ]
      },
      //修改参数对话框
      editDialogVisible: false,
      editForm: {},
      //修改表单的校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请添加参数名称", trigger: "blur" }
        ]
      },
      inputValue: ""
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
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });

      if (this.activeName === "many") {
        this.activeInfo = res.data;
      } else {
        this.staticInfo = res.data;
      }
    },
    //开启添加属性对话框
    dialogClick() {
      this.addDialogVisible = true;
    },
    //关闭对话框
    addDilalogClose() {
      this.$refs.addFormRef.resetFields();
      this.addDialogVisible = false;
    },
    //添加参数
    addDialogAttr() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.getId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数名称失败");
        }
        this.$message.success("添加参数名称成功");
        this.getParamsInfo();
        this.addDialogVisible = false;
      });
    },
    //提交修改表单参数
    editDialogAttr() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.getId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("提交修改参数失败!");
        }
        this.$message.success("提交修改参数成功!");
        this.getParamsInfo();
        this.editDialogVisible = false;
      });
    },
    //打开修改表单
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.getId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //重置初始参数
    editDilalogClose() {
      this.$refs.editFormRef.resetFields();
      this.editDialogVisible = false;
    },
    //删除参数
    async deleteAttr(attr_id) {
      const result = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (result !== "confirm") {
        return this.$message.info("已取消删除参数!");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.getId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败!");
      }
      this.$message.success("删除参数成功!");
      this.getParamsInfo();
    },
    //文本失去焦点或者按下enter触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      this.saveAttrVals(row);
    },
    async saveAttrVals(row) {
      //发起修改参数请求存入数据库
      const { data: res } = await this.$http.put(
        `categories/${this.getId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败");
      }
      this.$message.success("修改参数项成功!");
    },
    //点击展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除参数
    handleClose(row, tag) {
      console.log(row, tag);
      row.attr_vals.splice(tag, 1);
      this.saveAttrVals(row);
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
    },
    //动态或静态属性
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  margin: 15px 0 15px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 100px;
}
</style>
