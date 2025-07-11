class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  # allow_browser versions: :modern
  
  before_action :require_login
  
  protected
  
  def not_authenticated
    redirect_to login_path, alert: "로그인이 필요합니다."
  end
  
  def current_user_todos
    current_user&.todos || Todo.none
  end
  
  helper_method :current_user_todos
end
