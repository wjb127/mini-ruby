class HomeController < ApplicationController
  def index
  end

  def update_time
    render turbo_frame: "dynamic_content"
  end
end
