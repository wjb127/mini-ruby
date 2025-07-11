class HomeController < ApplicationController
  skip_before_action :require_login, only: [:index, :update_time]
  
  def index
  end

  def update_time
    render turbo_frame: "dynamic_content"
  end
end
