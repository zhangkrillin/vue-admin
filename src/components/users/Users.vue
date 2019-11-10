<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- Card 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索与添加 -->
        <el-col :span="10">
          <el-input placeholder="请输入查询用户姓名" v-model="params.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加信息 -->
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" border stripe>
        <!-- 添加索引 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 slot-scope-->
          <template slot-scope="scope">
            <!-- scope.row 获取列表信息 -->
            <el-switch v-model="scope.row.mg_state" @change="sendStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <!-- 自定义组件 -->
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配管理" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- Dialog 弹出一个对话框(添加用户) -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <!-- 邮箱-->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <!-- 手机号码 -->
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 用户修改按钮 dialog -->
    <el-dialog title="修改用户" :visible.sync="editDialog" width="50%" @click="editDialogClose">
      <!-- 用户名 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <!-- 邮箱-->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <!-- 手机号码 -->
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱合法性
    var checkEmail = (rule, value, callback) => {
      var emailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
      if (emailReg.test(value)) {
        return callback();
      }
      callback(new Error("邮箱输入不正确"));
    };
    //验证手机号码合法性
    var checkMobile = (rule, value, callback) => {
      var mobileReg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (mobileReg.test(value)) {
        return callback();
      }
      callback(new Error("手机号码输入不正确"));
    };
    return {
      //获取用户列表
      params: {
        query: "",
        //当前页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 2
      },
      userList: [],
      total: 0,
      dialogVisible: false,
      editDialog: false,
      //保存用户查询的信息
      editForm: {},
      //修改用户查询的信息的校验规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //添加用户表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //添加表单验证规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "密码长度在 6 到 16 个字符",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //向服务器发送请求
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.params
      });
      //console.log(res);

      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败!!!");
      }
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    //每页多少条
    handleSizeChange(newSize) {
      //console.log(newSize);
      this.params.pagesize = newSize;
      this.getUserList();
    },
    //当前页码值改变
    handleCurrentChange(newPage) {
      //console.log(newPage);
      this.params.pagenum = newPage;
      this.getUserList();
    },
    //发送el-switch状态
    async sendStatusChange(info) {
      const { data: res } = await this.$http.put(
        `users/${info.id}/state/${info.mg_state}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("用户状态更新失败");
      }
      this.$message.success("用户状态更新成功");
    },
    //监听修改用户的对话框关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    //监听添加用户对话框关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    //点击按钮,添加用户预校验
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        //发起添加用户的请求
        const { data: res } = await this.$http.post("users", this.addForm);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败!");
        }
        this.$message.success("用户添加成功!");
        //关闭对话框
        this.dialogVisible = false;
        //刷新列表
        this.getUserList();
      });
    },
    //展示编辑用户的修改框
    async showEditDialog(id) {
      this.editDialog = true;
      const { data: res } = await this.$http.get("users/" + id);
      //console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败!");
      }
      this.editForm = res.data;
    },
    //更新修改用户信息
    editUserInfo() {
      //更新用户预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        //效验成功后发送axios请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败!");
        }
        //关闭dialog对话框
        this.editDialog = false;
        //刷新修改数据
        this.getUserList();
        //提示更新成功
        this.$message.success("用户信息更新成功!");
      });
    },
    async deleteUser(id) {
      //提示用户是否删除
      const info = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (info !== "confirm") {
        return this.$message.info("已取消删除该用户");
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败!");
      }
      this.$message.success('删除用户成功!')
      this.getUserList()
    }
  }
};
</script>

<style lang="less" scoped>

</style>
