class SessionsController < ApplicationController
  skip_before_action :require_login, only: [:new, :create]
  
  def new
    # 로그인 폼
  end

  def create
    @user = login(params[:email], params[:password])
    
    if @user
      redirect_to root_path, notice: "로그인되었습니다!"
    else
      flash.now[:alert] = "이메일 또는 비밀번호가 잘못되었습니다."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    logout
    redirect_to login_path, notice: "로그아웃되었습니다."
  end
end
