<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- el-card 卡片-->
    <el-card>
      <!-- 警告提示 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!-- Steps 含状态步骤条 -->
      <el-steps :space="200" :active="activeName-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs标签 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeName"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <!-- 商品名称 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <!-- 商品价格 -->
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addForm.goods_price" type="number" min="0" step="0.01"></el-input>
            </el-form-item>
            <!-- 商品重量 -->
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight" type="number" min="0" step="0.1"></el-input>
            </el-form-item>
            <!-- 商品数量 -->
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addForm.goods_number" type="number" min="0"></el-input>
            </el-form-item>
            <!-- 商品分类 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="optProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTabsList" :key="item.attr_id">
              <!-- 商品参数多选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="it" v-for="(it, index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabsList" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片上传到后台api接口 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="setHeaders"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- dialog 显示框 -->
    <el-dialog title="照片展示" :visible.sync="dialogVisible" width="50%">
      <img :src="showImg" class="imgshow" />
    </el-dialog>
  </div>
</template>

<script>
import { log } from "util";
import _ from "lodash";
export default {
  data() {
    return {
      activeName: "0",
      dialogVisible: false,
      showImg: "",
      cateList: [],
      //动态属性参数列表
      manyTabsList: [],
      //静态属性参数列表
      onlyTabsList: [],
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: []
      },
      optProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      //上传图片地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      //设置上传图片请求头
      setHeaders: { Authorization: sessionStorage.getItem("token") }
    };
  },
  created() {
    this.getCategoriesList();
  },
  methods: {
    async getCategoriesList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表分类失败!");
      }
      this.cateList = res.data[0].children;
    },
    handleChange() {
      if (this.addForm.goods_cat.length !== 2) {
        this.addForm.goods_cat = [];
      }
    },
    //达成条件进入下一个标签
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 2) {
        this.$message.error("请先选择商品分类!");
        return false;
      }
    },
    //切换标签
    async tabClick() {
      if (this.activeName === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.getId}/attributes`,
          { params: { sel: "many" } }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品参数失败!");
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTabsList = res.data;
      } else if (this.activeName === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.getId}/attributes`,
          { params: { sel: "only" } }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品参数失败!");
        }
        this.onlyTabsList = res.data;
      }
    },
    //上传照片(处理图片预览)
    handlePreview(file) {
      this.dialogVisible = true;
      this.showImg = file.response.data.url;
    },
    //移除照片
    handleRemove(file) {
      const pathLoad = file.response.data.tmp_path;
      let index = this.addForm.pics.findIndex(item => {
        item.pic === pathLoad;
      });
      this.addForm.pics.splice(index, 1);
    },
    //图片上传成功返回的数据
    handleSuccess(res) {
      // 拼接得到图像对象
      const picInfo = {
        pic: res.data.tmp_path
      };
      // 添加到数组中
      this.addForm.pics.push(picInfo);
    },
    //添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项！");
        }
        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
        const goodsForm = _.cloneDeep(this.addForm);
        const num = Math.floor(Math.random() * 999) + 1;
        goodsForm.goods_cat.push(num);
        goodsForm.goods_cat = goodsForm.goods_cat.join(",");
        // 处理动态参数
        this.manyTabsList.forEach(item => {
          const info = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(info);
        });
        // 处理静态属性
        this.onlyTabsList.forEach(item => {
          const info = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(info);
        });
        goodsForm.attrs = this.addForm.attrs;
        console.log(goodsForm);

        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post("goods", goodsForm);

        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败！");
        }
        this.$message.success("添加商品成功！");
        this.$router.push("/goods");
      });
    }
  },
  computed: {
    getId() {
      if (this.addForm.goods_cat.length === 2) {
        return this.addForm.goods_cat[1];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 8px 0 !important;
}
.imgshow {
  width: 100%;
}
.quill-editor {
  margin-bottom: 15px;
}
</style>
