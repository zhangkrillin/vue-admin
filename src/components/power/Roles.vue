<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- el-card 卡片展示 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 渲染角色列表 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="[i1 === 0 ? 'bottop' : '','bottom','center']"
            >
              <el-col :span="5">
                <!-- 一级权限 -->
                <el-tag closable @close="removeRoleRights(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bottop','center']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRoleRights(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRoleRights(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope" width="300px">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="searchRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRoleRights(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- Dialog 弹出一个对话框(添加角色) -->
    <el-dialog title="添加角色" :visible.sync="dialogVisible" width="50%" @close="addRolesDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addRoles" :rules="addRolesRules" ref="addRolesRef" label-width="80px">
        <!-- 角色名称 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoles.roleName"></el-input>
        </el-form-item>
        <!-- 角色描述 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- Dialog 弹出一个对话框(修改角色) -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editRolesDialogClose"
    >
      <!-- 内容主体区域 -->
      <el-form :model="editRoles" :rules="editRolesRules" ref="editRolesRef" label-width="80px">
        <!-- 角色ID -->
        <el-form-item label="角色ID">
          <el-input v-model="editRoles.roleId" disabled></el-input>
        </el-form-item>
        <!-- 角色名称 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoles.roleName"></el-input>
        </el-form-item>
        <!-- 角色描述 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!--Dialog 弹出一个对话框(分配角色权限)  -->
    <el-dialog
      title="分配角色权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightRolesDialogClose"
    >
      <el-tree
        :data="rightList"
        :props="rightDefaultProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nodeId: "",
      //获取已有权限的id
      defKeys: [],
      rolesList: [],
      dialogVisible: false,
      editDialogVisible: false,
      //修改角色
      editRoles: {},
      editRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色名称长度在 2 到 10 个字符",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 8,
            message: "角色描述长度在 2 到 8个字符",
            trigger: "blur"
          }
        ]
      },
      //添加角色
      addRoles: {},
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色名称长度在 2 到 10 个字符",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 8,
            message: "角色描述长度在 2 到 8个字符",
            trigger: "blur"
          }
        ]
      },
      //分配角色权限对话框状态
      setRightDialogVisible: false,
      //获取权限列表
      rightList: [],
      rightDefaultProps: {
        children: "children",
        label: "authName"
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolesList = res.data;
    },
    //清除输入角色信息
    addRolesDialogClose() {
      this.$refs.addRolesRef.resetFields();
    },
    //清除修改角色信息
    editRolesDialogClose() {
      this.$refs.editRolesRef.resetFields();
    },
    //添加角色
    async addRolesInfo() {
      const { data: res } = await this.$http.post("roles", this.addRoles);
      if (res.meta.status !== 201) {
        return this.$message.error("添加角色失败");
      }
      this.dialogVisible = false;
      this.$message.success("添加角色成功");
      this.getRolesList();
    },
    //修改角色
    async searchRoles(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色失败");
      }
      this.editRoles = res.data;
    },
    //修改角色预校验
    editRolesInfo() {
      this.$refs.editRolesRef.validate(async valid => {
        if (!valid) return;

        const { data: res } = await this.$http.put(
          "roles/" + this.editRoles.roleId,
          {
            roleId: this.editRoles.roleId,
            roleName: this.editRoles.roleName,
            roleDesc: this.editRoles.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新角色信息失败!");
        }
        //关闭dialog对话框
        this.editDialogVisible = false;
        //刷新修改数据
        this.getRolesList();
        //提示更新成功
        this.$message.success("角色信息更新成功!");
      });
    },
    //删除角色
    async deleteRoles(id) {
      //提示用户是否删除
      const info = await this.$confirm(
        "此操作将永久删除该角色信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (info !== "confirm") {
        return this.$message.info("已取消删除该角色");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败!");
      }
      this.$message.success("删除角色成功!");
      this.getRolesList();
    },
    //删除角色权限
    async removeRoleRights(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除！");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！");
      }
      // this.getRolesList()
      role.children = res.data;
    },
    //分配角色权限
    async setRoleRights(role) {
      this.nodeId = role.id;
      this.setRightDialogVisible = true;
      const { data: res } = await this.$http.get("rights/tree");
      //console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色权限失败");
      }
      this.getNodeKeys(role, this.defKeys);
      this.rightList = res.data;
    },
    //通过递归来获取已有权限的节点ID
    getNodeKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getNodeKeys(item, arr);
      });
    },
    //关闭分配角色权限关闭对话框
    setRightRolesDialogClose() {
      this.defKeys = [];
      this.setRightDialogVisible = false;
    },
    //增加分配权限
    async addRights() {
      const allId = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const strId = allId.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.nodeId}/rights`,
        { rids: strId }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败!");
      }
      this.$message.success("分配权限成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.el-row {
  margin: 8px;
}
.bottop {
  border-top: 1px solid #eee;
}
.bottom {
  border-bottom: 1px solid #eee;
}
.center {
  display: flex;
  align-items: center;
}
</style>
