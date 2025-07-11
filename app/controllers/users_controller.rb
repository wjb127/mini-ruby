class UsersController < ApplicationController
  skip_before_action :require_login, only: [:new, :create]
  
  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    
    if @user.save
      auto_login(@user)
      redirect_to root_path, notice: "회원가입이 완료되었습니다!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @user = current_user
  end
  
  private
  
  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
