<template>
  <div class="login">
    <div class="login-box">
      <div class="logo">
        <img src="static/images/loading.gif"/>
      </div>
      <div class="body">
        <p class="tips">礼遇优果小店</p>
        <el-form ref="form" :model="form" :rules="rules" label-position="top">
          <el-form-item label="" prop="username">
            <el-input v-model="form.username" placeholder="用户名"></el-input>
          </el-form-item>
          <el-form-item label="" prop="password">
            <el-input
                type="password"
                v-model="form.password"
                placeholder="密码"
            ></el-input>
          </el-form-item>

          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="login-code">
              <el-input class="login-code-input" v-model="form.code" 
              size="large" auto-complete="off" placeholder="验证码" @keyup.enter.native="startLogin"/>
              <img :src="codeUrl" @click="getCode" class="login-code-img"/>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                @click="startLogin"
                :loading="loading"
                style="width: 100%"
            >
              {{ loading ? "登录中..." : "登录" }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import api from "@/config/api";
export default {
  data() {
    return {
      root: "",
      form: {
        username: "",
        password: "",
        code: "",
        uuid: "",
      },
      rules: {
        username: [
          {required: true, message: "请输入用户名", trigger: "blur"},
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {min: 6, message: "密码不得低于6个字符", trigger: "blur"},
        ],
      },
      loading: false,
      captchaEnabled: true,
      codeUrl: "",
    };
  },
  components: {},
  methods: {
    startLogin() {
      this.$refs["form"].validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true;
        let root = this.root;
        // 构造 URLSearchParams 以 application/x-www-form-urlencoded 方式提交
        const formData = new URLSearchParams();
        formData.append("username", this.form.username);
        formData.append("password", this.form.password);
        formData.append("code", this.form.code);
        formData.append("uuid", this.form.uuid);
        this.axios
            .post(root + "login", formData, {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                isToken: false,
              },
            })
            .then((res) => {
              let call = res.data;
              this.loading = false;
              if (res.data.code === 200) {
                console.log(res.data.data);
                localStorage.setItem("token", res.data.data.token);
                const userInfo = {
                  id: res.data.data.userId,
                  username: res.data.data.username,
                  name: res.data.data.username
                }
                localStorage.setItem(
                    "userInfo",
                    JSON.stringify(userInfo)
                );
                console.log(JSON.stringify(res.data.data.token));
                console.log(JSON.stringify(res.data.data.userInfo));
                this.$router.push({name: "welcome"});
                let sUserAgent = navigator.userAgent;
                // todo 手机端
                let mobileAgents = [
                  "Android",
                  "iPhone",
                  "Symbian",
                  "WindowsPhone",
                  "iPod",
                  "BlackBerry",
                  "Windows CE",
                ];
                let goUrl = 0;
                for (var i = 0; i < mobileAgents.length; i++) {
                  if (sUserAgent.indexOf(mobileAgents[i]) > -1) {
                    goUrl = 1;
                    break;
                  }
                }
                console.log(goUrl);
                if (goUrl == 1) {
                  this.$router.push({name: "wap"});
                }
              }
            })
            .catch((err) => {
              this.loading = false;
              const errJson = JSON.parse(JSON.stringify(err))
              console.log(errJson.response.data);
              this.$message({
                type: "error",
                message: errJson.response.data.msg,
              });
              return false;
            });
      });
    },
    getCode() {
      this.axios.get(this.root + "auth/code").then(res => {
        this.captchaEnabled = res.data.data.captchaEnabled === undefined ? true : res.data.data.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.data.data.img;
          this.form.uuid = res.data.data.uuid;
          this.form.code = ''
        }
      });
    }
  },
  mounted() {
    this.root = api.rootUrl;
    this.getCode();
  },
};
</script>
<style>
.login {
  align-items: center;
  background: url("https://www.qile.club/img/back.jpg");
  /* 以上为登录背景,可以自己更换成自己喜欢的 */
  background-size: 100%;
  background-repeat: no-repeat;
  display: flex;
  font-family: Lato, Helvetica, sans-serif;
  justify-content: center;
  text-align: center;
  height: 100%;
  width: 100%;
  color: #656565;
}

.login-box {
  width: 400px;
  background: #fff;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
  box-shadow: 2px 2px 12px #ccc;
}

.login-box .logo {
  height: 100px;
  padding-top: 30px;
  /*background: #324157;*/
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box .logo img {
  width: 80px;
  height: 80px;
}

.login-box .body {
  padding: 10px 30px 30px 30px;
}

.login-box .body .tips {
  font-size: 14px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  margin-bottom: 30px;
}

.login-box .body .author {
  display: block;
  font-size: 14px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: #656565;
  margin-bottom: 10px;
  text-decoration: none;
}

.login-box .body .author a {
  text-decoration: none;
}

.login-code {
  display: flex;
  align-items: center;
}

.login-code-img {
  height: 40px;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.login-code-input {
  flex: 1;
}
</style>
